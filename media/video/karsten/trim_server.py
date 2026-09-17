#!/usr/bin/env python3
"""
Browser-based video trimmer ("crop in length") for the karsten/ video folder.
Pure stdlib (http.server) + ffmpeg/ffprobe on PATH. No GUI toolkit involved,
so it avoids the Tk/XCB crash that any X11 GUI (Tk, Qt, GTK) hits on this
machine. Rendering/scrubbing happens in your browser via the native
<video> element; this script just serves files and shells out to ffmpeg.

Usage:
    python3 trim_server.py
    -> open http://localhost:8765 in a browser

For each *.mp4 in this directory (excluding already-trimmed output):
  - Scrub the native video player to find your in/out points.
  - Click "Set In" / "Set Out" to capture the player's current time.
  - Click "Trim & Save" to write <name>_trimmed.mp4 next to the original
    (original is left untouched).

Nothing leaves this machine; the server only binds to localhost.
"""
import html
import json
import re
import subprocess
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote

VIDEO_DIR = Path(__file__).resolve().parent
SUFFIX = "_trimmed"
PORT = 8765

RANGE_RE = re.compile(r"bytes=(\d*)-(\d*)")


def list_videos():
    return sorted(
        p.name for p in VIDEO_DIR.glob("*.mp4")
        if not Path(p.stem).stem.endswith(SUFFIX) and not p.stem.endswith(SUFFIX)
    )


def render_page():
    rows = []
    for name in list_videos():
        safe_name = html.escape(name)
        rows.append(f"""
        <div class="clip" data-video="{safe_name}">
          <h2>{safe_name}</h2>
          <video controls preload="metadata" src="/video/{safe_name}"></video>
          <div class="controls">
            <label>In: <input type="number" step="0.05" class="in-val" value="0"></label>
            <button class="set-in">Set In (from playhead)</button>
            <label>Out: <input type="number" step="0.05" class="out-val" value="0"></label>
            <button class="set-out">Set Out (from playhead)</button>
            <button class="trim">Trim &amp; Save</button>
            <span class="status"></span>
          </div>
        </div>""")

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Karsten video trimmer</title>
<style>
  body {{ font-family: sans-serif; background: #111; color: #eee; padding: 20px; }}
  .clip {{ border: 1px solid #333; border-radius: 8px; padding: 12px; margin-bottom: 24px; }}
  video {{ width: 100%; max-width: 900px; display: block; background: #000; }}
  .controls {{ margin-top: 8px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }}
  input[type=number] {{ width: 80px; }}
  button {{ cursor: pointer; }}
  .status {{ margin-left: 8px; }}
  .status.ok {{ color: #7fff7f; }}
  .status.err {{ color: #ff7f7f; }}
  .status.busy {{ color: #ffd37f; }}
</style>
</head>
<body>
<h1>Karsten video trimmer</h1>
<p>Scrub each clip to find in/out points, then Trim &amp; Save. Originals are never overwritten;
output is written as <code>&lt;name&gt;{SUFFIX}.mp4</code> next to the original.</p>
{"".join(rows)}
<script>
document.querySelectorAll('.clip').forEach(clip => {{
  const video = clip.querySelector('video');
  const inVal = clip.querySelector('.in-val');
  const outVal = clip.querySelector('.out-val');
  const status = clip.querySelector('.status');
  const name = clip.dataset.video;

  video.addEventListener('loadedmetadata', () => {{
    outVal.value = video.duration.toFixed(2);
  }});

  clip.querySelector('.set-in').addEventListener('click', () => {{
    inVal.value = video.currentTime.toFixed(2);
  }});
  clip.querySelector('.set-out').addEventListener('click', () => {{
    outVal.value = video.currentTime.toFixed(2);
  }});

  clip.querySelector('.trim').addEventListener('click', async () => {{
    status.textContent = 'Trimming...';
    status.className = 'status busy';
    try {{
      const resp = await fetch('/trim', {{
        method: 'POST',
        headers: {{'Content-Type': 'application/json'}},
        body: JSON.stringify({{
          video: name,
          start: parseFloat(inVal.value),
          end: parseFloat(outVal.value),
        }}),
      }});
      const data = await resp.json();
      if (data.ok) {{
        status.textContent = 'Saved: ' + data.output;
        status.className = 'status ok';
      }} else {{
        status.textContent = 'Error: ' + data.error;
        status.className = 'status err';
      }}
    }} catch (e) {{
      status.textContent = 'Error: ' + e;
      status.className = 'status err';
    }}
  }});
}});
</script>
</body>
</html>"""


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # keep console quiet

    def handle_one_request(self):
        try:
            super().handle_one_request()
        except (BrokenPipeError, ConnectionResetError):
            pass  # client aborted mid-response (normal during video seeking)

    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            body = render_page().encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if self.path.startswith("/video/"):
            name = unquote(self.path[len("/video/"):])
            path = VIDEO_DIR / name
            if ".." in name or "/" in name or not path.is_file():
                self.send_error(404)
                return
            self.serve_video(path)
            return

        self.send_error(404)

    def serve_video(self, path):
        size = path.stat().st_size
        range_header = self.headers.get("Range")
        start, end = 0, size - 1

        if range_header:
            m = RANGE_RE.match(range_header)
            if m:
                if m.group(1):
                    start = int(m.group(1))
                if m.group(2):
                    end = int(m.group(2))
        end = min(end, size - 1)
        length = end - start + 1

        self.send_response(206 if range_header else 200)
        self.send_header("Content-Type", "video/mp4")
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(length))
        if range_header:
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.end_headers()

        with open(path, "rb") as f:
            f.seek(start)
            remaining = length
            chunk_size = 1024 * 1024
            while remaining > 0:
                chunk = f.read(min(chunk_size, remaining))
                if not chunk:
                    break
                try:
                    self.wfile.write(chunk)
                except (BrokenPipeError, ConnectionResetError):
                    return
                remaining -= len(chunk)

    def do_POST(self):
        if self.path != "/trim":
            self.send_error(404)
            return

        length = int(self.headers.get("Content-Length", 0))
        try:
            payload = json.loads(self.rfile.read(length))
            name = payload["video"]
            start = float(payload["start"])
            end = float(payload["end"])
        except (KeyError, ValueError, json.JSONDecodeError):
            self.respond_json({"ok": False, "error": "bad request"}, status=400)
            return

        if ".." in name or "/" in name:
            self.respond_json({"ok": False, "error": "bad filename"}, status=400)
            return

        src = VIDEO_DIR / name
        if not src.is_file():
            self.respond_json({"ok": False, "error": "video not found"}, status=404)
            return

        if end - start < 0.1:
            self.respond_json({"ok": False, "error": "out must be after in"}, status=400)
            return

        out_path = src.with_name(src.stem + SUFFIX + src.suffix)
        cmd = [
            "ffmpeg", "-y",
            "-ss", f"{start:.3f}", "-to", f"{end:.3f}",
            "-i", str(src),
            "-c:v", "libx264", "-crf", "18", "-preset", "veryfast",
            "-c:a", "aac",
            str(out_path),
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            self.respond_json({"ok": False, "error": result.stderr[-2000:]}, status=500)
            return

        self.respond_json({"ok": True, "output": out_path.name})

    def respond_json(self, obj, status=200):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    videos = list_videos()
    if not videos:
        print("No videos found in", VIDEO_DIR)
        return
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"Serving {len(videos)} clip(s) at http://localhost:{PORT}  (Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
