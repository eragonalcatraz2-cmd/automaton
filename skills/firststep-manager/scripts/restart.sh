#!/bin/bash
# FirstStep 重启脚本

VPS_IP="${FIRSTSTEP_VPS_IP:-43.167.195.89}"
SSH_KEY="${FIRSTSTEP_SSH_KEY:-~/.ssh/automaton_ed25519}"

echo "=== 重启 FirstStep ==="
echo ""

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@$VPS_IP "systemctl restart firststep.service && sleep 2 && systemctl status firststep.service --no-pager" 2>&1