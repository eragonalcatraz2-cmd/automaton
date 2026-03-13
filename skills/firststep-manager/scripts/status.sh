#!/bin/bash
# FirstStep 状态检查脚本

VPS_IP="${FIRSTSTEP_VPS_IP:-43.167.195.89}"
SSH_KEY="${FIRSTSTEP_SSH_KEY:-~/.ssh/automaton_ed25519}"

echo "=== FirstStep 状态检查 ==="
echo ""

# 检查服务状态
echo "📊 服务状态:"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@$VPS_IP "systemctl status firststep.service --no-pager" 2>&1 | head -20

echo ""
echo "📈 资源使用:"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@$VPS_IP "ps aux | grep -E '(firststep|tsx)' | grep -v grep" 2>&1

echo ""
echo "💾 数据库状态:"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@$VPS_IP "ls -lh /opt/firststep/data/ 2>/dev/null || echo '数据目录不存在'"

echo ""
echo "📝 最近日志:"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@$VPS_IP "journalctl -u firststep.service --no-pager -n 20" 2>&1