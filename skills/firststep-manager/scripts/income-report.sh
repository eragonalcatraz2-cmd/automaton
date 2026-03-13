#!/bin/bash
# FirstStep 收入报告脚本

VPS_IP="${FIRSTSTEP_VPS_IP:-43.167.195.89}"
SSH_KEY="${FIRSTSTEP_SSH_KEY:-~/.ssh/automaton_ed25519}"

echo "=== FirstStep 收入报告 ==="
echo ""

# 查询数据库
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@$VPS_IP "
cd /opt/firststep && sqlite3 data/firststep.db <<'EOF'
SELECT 
  datetime(timestamp, 'localtime') as time,
  channel,
  amount,
  currency,
  status
FROM income
ORDER BY timestamp DESC
LIMIT 20;
EOF
" 2>&1 | column -t -s '|'

echo ""
echo "=== 24小时收入统计 ==="
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@$VPS_IP "
cd /opt/firststep && sqlite3 data/firststep.db <<'EOF'
SELECT 
  channel,
  COUNT(*) as count,
  ROUND(SUM(amount), 2) as total
FROM income
WHERE timestamp > datetime('now', '-1 day')
AND status = 'success'
GROUP BY channel;
EOF
" 2>&1 | column -t -s '|'