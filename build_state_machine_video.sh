#!/usr/bin/env bash
#
# Prepare the THREE side-by-side videos for the "state machine in action" slide.
#   recording cam  -> sm_recording_compressed.mp4  (cut to its first 5 episodes)
#   front cam      -> sm_front_compressed.mp4       (lerobot, per-episode aligned)
#   wrist cam      -> sm_wrist_compressed.mp4       (lerobot, per-episode aligned)
#
# The recording cam has 8 episodes but the lerobot dataset only the first 5.
# Each lerobot episode is retimed to its matching recording-cam segment, so all
# three clips are the same length AND frame-aligned per episode.

set -euo pipefail

REC="ur5/state_machine.mp4"
LEROBOT="ur5/lerobot/lerobot/videos/chunk-000"
FRONT_DIR="$LEROBOT/observation.images.camera_front_view"
WRIST_DIR="$LEROBOT/observation.images.camera_wrist_view"
OUTDIR="media/video/ur5_chess"
TARGET_FPS=30

# Recording-cam episode START boundaries (seconds, user-provided).
# First 5 episodes = the ones present in the lerobot dataset; index 5 is the cut point.
REC_BOUNDS=(0 9.5 20 32 46 55.5)
N=5

TMP="ur5/_sm_tmp"
mkdir -p "$TMP" "$OUTDIR" img/posters
dur(){ ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }

# retime a clip to an exact target duration, output @TARGET_FPS
retime(){ local in="$1" out="$2" target="$3" sp
  sp=$(echo "$(dur "$in") $target" | awk '{printf "%.6f",$1/$2}')
  ffmpeg -loglevel error -y -i "$in" -filter:v "setpts=PTS/${sp},fps=${TARGET_FPS}" -an "$out"
}

# retime each of the first N episodes to its recording-cam segment, then concat
build_cam(){
  local dir="$1" out="$2" list="$TMP/$(basename "$out").txt"; : > "$list"
  local i=0
  for f in $(ls "$dir"/*.mp4 | sort); do
    [ "$i" -lt "$N" ] || break
    local target; target=$(echo "${REC_BOUNDS[$((i+1))]} ${REC_BOUNDS[$i]}" | awk '{printf "%.4f",$1-$2}')
    local seg="$TMP/$(basename "$out")_$i.mp4"
    echo "  ep$i $(basename "$f") ($(dur "$f")s) -> ${target}s"
    retime "$f" "$seg" "$target"
    echo "file '$(cygpath -m -a "$seg")'" >> "$list"
    i=$((i+1))
  done
  ffmpeg -loglevel error -y -f concat -safe 0 -i "$list" -vcodec libx264 -crf 25 -an "$out"
}

echo "[1/3] front cam (per-episode aligned)"; build_cam "$FRONT_DIR" "$OUTDIR/sm_front_compressed.mp4"
echo "[2/3] wrist cam (per-episode aligned)"; build_cam "$WRIST_DIR" "$OUTDIR/sm_wrist_compressed.mp4"
echo "[3/3] recording cam (cut to first $N episodes: 0-${REC_BOUNDS[$N]}s)"
ffmpeg -loglevel error -y -i "$REC" -t "${REC_BOUNDS[$N]}" \
  -filter:v "scale=1024:1024:force_original_aspect_ratio=decrease,crop=trunc(iw/2)*2:trunc(ih/2)*2" \
  -vcodec libx264 -crf 25 -an "$OUTDIR/sm_recording_compressed.mp4"

for v in sm_recording sm_front sm_wrist; do
  ffmpeg -loglevel error -y -i "$OUTDIR/${v}_compressed.mp4" -vframes 1 -an -ss 1 "img/posters/${v}_compressed_poster.jpeg"
done
rm -rf "$TMP"
echo "DONE (all should be ${REC_BOUNDS[$N]}s): rec=$(dur "$OUTDIR/sm_recording_compressed.mp4") front=$(dur "$OUTDIR/sm_front_compressed.mp4") wrist=$(dur "$OUTDIR/sm_wrist_compressed.mp4")"
