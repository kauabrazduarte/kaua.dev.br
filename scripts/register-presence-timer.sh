#!/usr/bin/env bash
# One-time setup: registers the systemd --user timer that drives site
# presence on Linux.
#
# Run this ONCE:
#     bash scripts/register-presence-timer.sh
#
# After this, presence-process-watch.sh runs every 10 minutes and marks you
# "coding right now" on kaua.dev.br whenever Riggr / a terminal (Kitty,
# Alacritty, ...) / Zed is open. To remove it later:
#     systemctl --user disable --now kaua-dev-presence.timer
#     rm ~/.config/systemd/user/kaua-dev-presence.{service,timer}
#     systemctl --user daemon-reload
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
watch_script="$script_dir/presence-process-watch.sh"
[[ -f "$watch_script" ]] || { echo "Nao encontrei $watch_script" >&2; exit 1; }
chmod +x "$watch_script"

command -v systemctl >/dev/null 2>&1 || { echo "systemctl nao encontrado (precisa de systemd)" >&2; exit 1; }

unit_dir="$HOME/.config/systemd/user"
mkdir -p "$unit_dir"

# Type=oneshot: the unit starts, runs the watcher to completion (a fraction
# of a second — one pgrep, at most one curl), and exits. Nothing stays
# resident between timer ticks. Nice/IOSchedulingClass push it to the back of
# the queue so it never contends with whatever you're actually doing.
cat > "$unit_dir/kaua-dev-presence.service" <<EOF
[Unit]
Description=Marca presenca kaua.dev.br como "codando agora" (Riggr/terminal/Zed aberto)

[Service]
Type=oneshot
Nice=19
IOSchedulingClass=idle
ExecStart=/usr/bin/env bash "$watch_script"
EOF

# Fires shortly after the timer is enabled, then every 10 minutes. The 30-min
# server-side TTL means a missed tick or two (e.g. laptop asleep) never flips
# you offline mid-session. Persistent=true catches up with one run if the
# machine was asleep/off across a scheduled tick, instead of silently
# skipping it.
cat > "$unit_dir/kaua-dev-presence.timer" <<'EOF'
[Unit]
Description=A cada 10 min, verifica se Riggr/terminal/Zed esta aberto

[Timer]
OnBootSec=2min
OnUnitActiveSec=10min
AccuracySec=1min
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now kaua-dev-presence.timer

echo "OK - timer 'kaua-dev-presence' registrado (roda a cada 10 min)."

if [[ "$(loginctl show-user "$USER" -p Linger --value 2>/dev/null)" != "yes" ]]; then
  echo "Nota: Linger esta desligado, entao o timer so roda enquanto voce tiver sessao"
  echo "ativa (login grafico/TTY). Isso e o esperado para 'estou codando agora'."
  echo "Se quiser que sobreviva a logout tambem: loginctl enable-linger \$USER"
fi
