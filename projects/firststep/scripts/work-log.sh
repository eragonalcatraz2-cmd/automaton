#!/bin/bash
# FirstStep 工作日志记录脚本
# 每天 12:00 和 18:00 自动执行

WORK_LOG_DIR="/home/user1/.openclaw/workspace/projects/firststep/docs/work-log"
MEMORY_DIR="/home/user1/.openclaw/workspace/memory"
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
HOUR=$(date +%H)

# 确定时段
if [ "$HOUR" -lt 12 ]; then
  PERIOD="上午"
elif [ "$HOUR" -lt 18 ]; then
  PERIOD="下午"
else
  PERIOD="晚上"
fi

# 创建日志目录
mkdir -p "$WORK_LOG_DIR"
mkdir -p "$MEMORY_DIR"

LOG_FILE="$WORK_LOG_DIR/$DATE.md"
MEMORY_FILE="$MEMORY_DIR/$DATE.md"

# 如果日志文件不存在，创建头部
if [ ! -f "$LOG_FILE" ]; then
  cat > "$LOG_FILE" << EOF
# FirstStep 工作日志 - $DATE

## 项目信息
- **项目**: FirstStep v3.0
- **日期**: $DATE
- **记录时间**: $TIME CST

---

## 上午工作记录 (12:00前)

*待记录...*

---

## 下午工作记录 (18:00前)

*待记录...*

---

## 技术细节

### 部署信息
- **VPS IP**: 43.167.195.89
- **服务**: firststep.service

### 钱包地址
- **BSC**: 0xED261c7431667c91ef28C1320Ff97cF962689710
- **TRON**: THtT5pyjge4LGChAryFPwJ2r19YgZr2beJ

---

*自动生成的项目工作日志*
EOF
fi

# 获取 FirstStep 状态
VPS_IP="43.167.195.89"
SSH_KEY="${FIRSTSTEP_SSH_KEY:-~/.ssh/automaton_ed25519}"

# 获取服务状态
SERVICE_STATUS=$(ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@$VPS_IP "systemctl is-active firststep.service" 2>/dev/null || echo "unknown")

# 获取最近日志
RECENT_LOGS=$(ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@$VPS_IP "journalctl -u firststep.service --no-pager -n 10 2>/dev/null | tail -5" || echo "无法获取日志")

# 获取余额信息
BALANCE_INFO=$(ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@$VPS_IP "cd /opt/firststep && sqlite3 data/firststep.db 'SELECT channel, SUM(amount) FROM income WHERE timestamp > datetime(\"now\", \"-1 day\") GROUP BY channel;' 2>/dev/null" || echo "无数据")

# 生成工作内容
WORK_CONTENT="
### ${PERIOD}工作记录 ($TIME)

**服务状态**: ${SERVICE_STATUS}

**最近活动**:
\`\`\`
${RECENT_LOGS}
\`\`\`

**24小时收入统计**:
\`\`\`
${BALANCE_INFO}
\`\`\`

**完成工作**:
- 监控 FirstStep 运行状态
- 检查收入机会扫描结果
- 记录系统运行指标

---
"

# 更新日志文件（替换对应时段的占位符）
if [ "$PERIOD" = "上午" ]; then
  # 替换上午部分
  sed -i '/## 上午工作记录 (12:00前)/,/^---$/c\
## 上午工作记录 (12:00前)\
\
'"${WORK_CONTENT}"'' "$LOG_FILE"
elif [ "$PERIOD" = "下午" ]; then
  # 替换下午部分
  sed -i '/## 下午工作记录 (18:00前)/,/^---$/c\
## 下午工作记录 (18:00前)\
\
'"${WORK_CONTENT}"'' "$LOG_FILE"
fi

# 创建/更新记忆文件
if [ ! -f "$MEMORY_FILE" ]; then
  cat > "$MEMORY_FILE" << EOF
# $DATE 记忆

## 项目工作日志
- **FirstStep v3.0**: $WORK_LOG_DIR/$DATE.md

## 今日工作
- 配置 FirstStep 定时工作日志记录
- 自动记录服务状态和收入情况

## 文档地址
- 工作日志: $WORK_LOG_DIR/$DATE.md
- 项目文档: /home/user1/.openclaw/workspace/projects/firststep/docs/

---

*自动生成于 $TIME*
EOF
else
  # 更新记忆文件中的文档地址
  if ! grep -q "FirstStep v3.0.*$DATE" "$MEMORY_FILE"; then
    echo "" >> "$MEMORY_FILE"
    echo "## 项目工作日志更新 ($TIME)" >> "$MEMORY_FILE"
    echo "- **FirstStep v3.0**: $WORK_LOG_DIR/$DATE.md" >> "$MEMORY_FILE"
  fi
fi

echo "[$TIME] 工作日志已记录到: $LOG_FILE"
echo "[$TIME] 记忆已更新: $MEMORY_FILE"