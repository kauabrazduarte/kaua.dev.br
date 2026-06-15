# One-time setup: registers the Windows Scheduled Task that drives site presence.
#
# Run this ONCE, in your own PowerShell:
#     powershell -ExecutionPolicy Bypass -File scripts\register-presence-task.ps1
#
# If it prints "Acesso negado", reopen PowerShell as Administrator and run again.
#
# After this, presence-process-watch.ps1 runs every 10 minutes and marks you
# "coding right now" on kaua.dev.br whenever Warp / Zed / Riggr is open.
# To remove it later:  Unregister-ScheduledTask -TaskName 'kaua-dev-presence' -Confirm:$false
$ErrorActionPreference = 'Stop'

$script = Join-Path $PSScriptRoot 'presence-process-watch.ps1'
if (-not (Test-Path $script)) { throw "Nao encontrei $script" }

$launcher = Join-Path $PSScriptRoot 'run-hidden.vbs'
if (-not (Test-Path $launcher)) { throw "Nao encontrei $launcher" }

# Launch through wscript.exe + run-hidden.vbs so no console window ever flashes.
# Running powershell.exe directly (even -WindowStyle Hidden) blinks a console
# every time the task fires.
$action = New-ScheduledTaskAction -Execute 'wscript.exe' `
  -Argument "`"$launcher`" `"$script`""

# Fire shortly after logon, then repeat every 10 minutes indefinitely. The 30-min
# server TTL means a missed beat or two never flips you offline mid-session.
$trigger = New-ScheduledTaskTrigger -AtLogOn
$trigger.Repetition = (New-ScheduledTaskTrigger -Once -At (Get-Date) `
  -RepetitionInterval (New-TimeSpan -Minutes 10)).Repetition

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew

$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" `
  -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName 'kaua-dev-presence' -Action $action -Trigger $trigger `
  -Settings $settings -Principal $principal -Force `
  -Description 'Marca presenca kaua.dev.br como coding-now enquanto Warp/Zed/Riggr estiver aberto' | Out-Null

Write-Host "OK - tarefa 'kaua-dev-presence' registrada (roda a cada 10 min)." -ForegroundColor Green
