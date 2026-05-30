# Presence heartbeat — fired by the Claude Code `UserPromptSubmit` hook
# (see .claude/settings.local.json). Every time I send a prompt to Claude Code,
# this marks me "working now" by POSTing to the site's /api/presence.
#
# Fire-and-forget: the actual HTTP request runs in a DETACHED child process so
# the hook returns instantly and never adds latency to my prompt. This script
# itself carries no secret — it reads url + token from .claude/presence.local.json
# (gitignored).
$ErrorActionPreference = 'SilentlyContinue'

$configPath = Join-Path $PSScriptRoot '..\.claude\presence.local.json'
if (-not (Test-Path $configPath)) { exit 0 }

try {
  $cfg = Get-Content -Raw -Path $configPath | ConvertFrom-Json
} catch { exit 0 }

$url = $cfg.url
$token = $cfg.token
if ([string]::IsNullOrWhiteSpace($url) -or [string]::IsNullOrWhiteSpace($token)) { exit 0 }

# The child swallows every error: an offline dev server or no network must never
# surface in my terminal. Encoded as base64 so the url/token need no quoting.
$inner = "try { Invoke-RestMethod -Uri '$url' -Method Post -Headers @{ 'x-presence-token' = '$token' } -TimeoutSec 4 | Out-Null } catch {}"
$encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($inner))

Start-Process -FilePath 'powershell' -WindowStyle Hidden -ArgumentList @(
  '-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', $encoded
)
