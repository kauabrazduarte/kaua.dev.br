# Presence process watcher.
#
# Marks me "coding right now" on the site whenever one of my dev apps is open.
# Run on a schedule (Task Scheduler, every ~10 min). Each run:
#   1. Looks for any process whose name contains one of $targets.
#   2. If found, POSTs a heartbeat to /api/presence (30-min TTL on the server).
#   3. If nothing is open, does nothing. The key expires and the site flips
#      back to "open to chat" on its own. No cleanup needed.
#
# Reads url + token from .claude/presence.local.json (gitignored), the same
# config the Claude Code hook uses. This script carries no secret of its own.
$ErrorActionPreference = 'SilentlyContinue'

# Substring match against process names, case-insensitive. Doesn't need the exact
# executable name: "warp" matches Warp.exe, "zed" matches Zed.exe, etc. Edit this
# list to add/remove the apps that count as "I'm programming".
$targets = @('warp', 'zed', 'rigg')

$running = Get-Process |
  Where-Object { $name = $_.ProcessName.ToLower(); $targets | Where-Object { $name -like "*$_*" } } |
  Select-Object -First 1
if (-not $running) { exit 0 }

$configPath = Join-Path $PSScriptRoot '..\.claude\presence.local.json'
if (-not (Test-Path $configPath)) { exit 0 }

try {
  $cfg = Get-Content -Raw -Path $configPath | ConvertFrom-Json
} catch { exit 0 }

$url = $cfg.url
$token = $cfg.token
if ([string]::IsNullOrWhiteSpace($url) -or [string]::IsNullOrWhiteSpace($token)) { exit 0 }

# Fire the heartbeat. Short timeout, all errors swallowed: an offline network or
# server must never make the scheduled task noisy.
try {
  Invoke-RestMethod -Uri $url -Method Post -Headers @{ 'x-presence-token' = $token } -TimeoutSec 4 | Out-Null
} catch {}
