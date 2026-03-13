---
name: firststep-manager
description: Manage FirstStep autonomous AI Agent - check status, view logs, manage income channels, and monitor earnings.
---

# FirstStep Manager

管理 FirstStep 自主 AI Agent 的专用工具。

## 功能

- 📊 **状态监控** - 查看服务运行状态和资源使用
- 📝 **日志查看** - 实时查看 Agent 运行日志
- 🔄 **服务管理** - 重启、停止、启动服务
- 💰 **收入报告** - 查看收入记录和统计
- ⚙️ **配置管理** - 管理钱包和通知配置

## 使用

### 查看状态
```
检查 FirstStep 状态
```
运行 `scripts/status.sh`

### 查看日志
```
查看 FirstStep 日志
```
运行 `scripts/logs.sh [行数]`

### 重启服务
```
重启 FirstStep
```
运行 `scripts/restart.sh`

### 收入报告
```
查看 FirstStep 收入
```
运行 `scripts/income-report.sh`

## 配置

环境变量：
- `FIRSTSTEP_VPS_IP` - VPS IP 地址（默认：43.167.195.89）
- `FIRSTSTEP_SSH_KEY` - SSH 密钥路径（默认：~/.ssh/automaton_ed25519）

## 脚本说明

| 脚本 | 功能 |
|------|------|
| `status.sh` | 查看服务状态、资源使用、数据库状态 |
| `logs.sh` | 查看最近日志 |
| `restart.sh` | 重启服务 |
| `income-report.sh` | 查看收入记录和统计 |

## 示例输出

### 状态检查
```
=== FirstStep 状态检查 ===

📊 服务状态:
● firststep.service - FirstStep Autonomous Agent
   Active: active (running)
   Memory: 196.9M

📈 资源使用:
root     238769  0.0  2.0  ...  tsx src/index.ts run

💾 数据库状态:
-rw-r--r-- 1 root root 24K Mar 13 10:41 firststep.db
```

### 收入报告
```
=== FirstStep 收入报告 ===

time                 channel   amount  currency  status
-------------------  --------  ------  --------  ------
2026-03-13 10:41:40  airdrop   0       USD       pending
...

=== 24小时收入统计 ===
channel   count  total
--------  -----  -----
airdrop   2      0.00
```