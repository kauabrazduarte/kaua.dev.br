' run-hidden.vbs — launches a PowerShell script with ZERO console flash.
'
' wscript.exe has no console window of its own, and Run(..., 0, ...) starts the
' child with a hidden window, so nothing ever blinks on screen. This is the
' reliable Windows way to run a .ps1 silently — `powershell -WindowStyle Hidden`
' alone still flashes a console for a split second.
'
' Used by the kaua.dev.br presence heartbeat (Claude Code hook) and the
' kaua-dev-presence scheduled task.
'   Usage:  wscript.exe run-hidden.vbs "<full path to .ps1>"
Option Explicit
Dim sh, ps1, cmd
Set sh = CreateObject("WScript.Shell")
ps1 = WScript.Arguments(0)
cmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & ps1 & """"
sh.Run cmd, 0, False
