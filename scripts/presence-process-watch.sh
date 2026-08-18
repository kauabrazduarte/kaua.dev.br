#!/usr/bin/env bash
# Presence process watcher (Linux).
#
# Marks me "coding right now" on the site whenever Riggr, a terminal
# emulator, or Zed is open. Run on a schedule (systemd --user timer, every
# ~10 min — see register-presence-timer.sh). Each run:
#   1. Looks for any process whose name matches one of $targets_regex.
#   2. If found, POSTs a heartbeat to /api/presence (30-min TTL on the server).
#   3. If nothing is open, does nothing. The key expires and the site flips
#      back to "open to chat" on its own. No cleanup needed.
#
# Reads url + token from .claude/presence.local.json (gitignored), the same
# config the Claude Code hook uses. This script carries no secret of its own.
#
# Deliberately dependency-light and fail-silent (mirrors
# presence-process-watch.ps1): a missing tool, missing config, offline
# network, or dead server must never make the timer noisy or leave a process
# behind. `pgrep` is a single /proc scan (no polling loop, nothing resident
# between runs), so idle cost is effectively zero.

# Substring match against process names (comm, up to 15 chars — pgrep matches
# unanchored, so truncation is harmless as long as the pattern is a prefix).
# Edit this to add/remove the apps that count as "I'm programming". To find a
# process's name: `ps -eo comm= | sort -u`.
targets_regex='riggr|kitty|alacritty|zed|konsole|gnome-terminal|xterm|terminator|tilix|foot|wezterm|ghostty|xfce4-terminal|urxvt|terminology|warp-terminal|deepin-terminal|kgx|lxterminal|mate-terminal|qterminal|sakura|guake|yakuake|tilda|hyper|termite|cool-retro-term'

command -v pgrep >/dev/null 2>&1 || exit 0
command -v curl >/dev/null 2>&1 || exit 0
command -v jq >/dev/null 2>&1 || exit 0

pgrep -i "$targets_regex" >/dev/null 2>&1 || exit 0

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
config_path="$script_dir/../.claude/presence.local.json"
[[ -f "$config_path" ]] || exit 0

url="$(jq -r '.url // empty' "$config_path" 2>/dev/null)"
token="$(jq -r '.token // empty' "$config_path" 2>/dev/null)"
[[ -n "$url" && -n "$token" ]] || exit 0

# Short timeout, all errors swallowed: an offline dev server or no network
# must never surface anywhere.
curl -fsS --max-time 4 -X POST -H "x-presence-token: $token" "$url" >/dev/null 2>&1 || true
