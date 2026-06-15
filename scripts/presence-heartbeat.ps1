# Presence heartbeat — fired by the Claude Code `UserPromptSubmit` hook, which
# launches it through scripts\run-hidden.vbs (see .claude/settings.local.json).
# Every time I send a prompt to Claude Code, this marks me "working now" by
# POSTing to the site's /api/presence.
#
# run-hidden.vbs already runs this fully hidden and without waiting, so the hook
# returns instantly and no console window ever flashes — no detached child of our
# own is needed. Carries no secret: reads url + token from
# .claude/presence.local.json (gitignored).
$ErrorActionPreference = 'SilentlyContinue'

$configPath = Join-Path $PSScriptRoot '..\.claude\presence.local.json'
if (-not (Test-Path $configPath)) { exit 0 }

try {
  $cfg = Get-Content -Raw -Path $configPath | ConvertFrom-Json
} catch { exit 0 }

$url = $cfg.url
$token = $cfg.token
if ([string]::IsNullOrWhiteSpace($url) -or [string]::IsNullOrWhiteSpace($token)) { exit 0 }

# Short timeout, all errors swallowed: an offline dev server or no network must
# never surface anywhere.
try {
  Invoke-RestMethod -Uri $url -Method Post -Headers @{ 'x-presence-token' = $token } -TimeoutSec 4 | Out-Null
} catch {}
