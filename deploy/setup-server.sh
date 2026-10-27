#!/usr/bin/env bash
# One-time setup for a fresh Ubuntu 24.04 VPS. Run as root:
#   curl -fsSL <raw URL of deploy/setup-server.sh in your repo> | bash
# or copy it over and run:  bash setup-server.sh
#
# Installs Docker, a firewall, automatic security updates, swap (the image
# builds need more than 4 GB RAM at peak), and a daily database backup.
set -euo pipefail

APP_DIR=/opt/wdis

echo "==> System updates"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y
apt-get install -y ca-certificates curl git ufw unattended-upgrades fail2ban

echo "==> Automatic security updates"
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "==> Firewall: SSH + HTTP(S) only"
if grep -qi oraclecloud /sys/class/dmi/id/chassis_asset_tag 2>/dev/null; then
  # Oracle Cloud images ship iptables rules the instance needs (boot volume,
  # metadata service) and Oracle says not to use ufw. Open 80/443 ahead of
  # the image's catch-all REJECT instead. Also open them in the VCN's
  # security list in the Oracle console.
  DEBIAN_FRONTEND=noninteractive apt-get install -y iptables-persistent
  for rule in "-p tcp --dport 80" "-p tcp --dport 443" "-p udp --dport 443"; do
    iptables -C INPUT $rule -m state --state NEW -j ACCEPT 2>/dev/null \
      || iptables -I INPUT 5 $rule -m state --state NEW -j ACCEPT
  done
  netfilter-persistent save
else
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow OpenSSH
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw allow 443/udp
  ufw --force enable
fi

echo "==> Swap (4 GB)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo "/swapfile none swap sw 0 0" >> /etc/fstab
  sysctl -w vm.swappiness=10
  echo "vm.swappiness=10" > /etc/sysctl.d/99-swappiness.conf
fi

echo "==> Docker"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

echo "==> App directory: $APP_DIR"
mkdir -p "$APP_DIR"

echo "==> Daily database backup at 03:30"
cat > /etc/cron.d/wdis-backup <<EOF
30 3 * * * root cd $APP_DIR && bash deploy/backup.sh >> /var/log/wdis-backup.log 2>&1
EOF

cat <<EOF

Done. Next steps:
  1. git clone <your repo> $APP_DIR
  2. cd $APP_DIR && cp .env.production.example .env.production && nano .env.production
  3. bash deploy/deploy.sh
EOF
