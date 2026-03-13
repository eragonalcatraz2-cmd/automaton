#!/bin/bash
# FirstStep 日志查看脚本

VPS_IP="${FIRSTSTEP_VPS_IP:-43.167.195.89}"
SSH_KEY="${FIRSTSTEP_SSH_KEY:-~/.ssh/automaton_ed25519}"
LINES="${1:-50}"

echo "=== FirstStep 日志 (最近 $LINES 行) ==="
echo ""

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@$VPS_IP "journalctl -u firststep.service --no-pager -n $LINES" 2>&1