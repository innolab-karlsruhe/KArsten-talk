#!/usr/bin/env bash
#
# Pull new / changed video resources from the capture machine.
# Re-run anytime: rsync transfers only what's missing or changed,
# so you always converge to the remote's current state.

set -euo pipefail

# ─── EDIT THESE TWO ──────────────────────────────────────────────────────────
REMOTE="innovation-hacking@minionsarg.ihack.host"                  # your ssh target, e.g. tobi@192.168.1.42
REMOTE_DIR="/home/innovation-hacking/heizmany/ur5_chess/resources"   # folder on the remote holding the videos
# ─────────────────────────────────────────────────────────────────────────────

LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)/ur5"
mkdir -p "$LOCAL_DIR"

# -a archive, -v verbose, -z compress, -h human sizes, --progress per-file bar.
# Trailing slash on the source copies its *contents* into LOCAL_DIR.
rsync -avzh --progress -e ssh "$REMOTE:$REMOTE_DIR/" "$LOCAL_DIR/"
