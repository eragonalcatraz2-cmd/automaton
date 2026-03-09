# MEMORY.md - 长期记忆

## 🌍 环境特性

### 网络限制
- **GitHub 无法直连**: 所有 github.com 请求超时
- **镜像站不稳定**: ghproxy, fastgit 等均不可用
- **ClawHub 有限速**: API 调用频繁会触发 rate limit
- **策略**: 外部下载超过 5 分钟未成功 → 立即转本地创建

### OpenClaw 配置
- **版本**: 2026.2.24 (df9a474) stable channel
- **安全警告**: Feishu groupPolicy="open" + elevated 工具暴露（需关注）
- **浏览器服务**: 当前未启动

---

## 👤 用户偏好

### 工作流程
- 安装前必须 healthcheck ✓
- 遇到问题要复盘记录 ✓
- 喜欢自进化的 skill ✓

### 沟通期望
- **主动汇报** - 完成任务后立即告知结果，不等用户询问
- **进度更新** - 耗时较长的任务，中途也应汇报进展

### 沟通风格
- 日常：活泼有趣
- 正经问题：严肃准确，经核实后回答

---

## 🛠️ 最佳实践

### Skill 安装（网络受限环境）
```
1. healthcheck（必须）
2. clawhub inspect <skill> 获取元数据
3. 测试网络: curl -I github.com
4. 如果失败 → 手动创建 skill 目录和 SKILL.md
5. 基于描述实现核心功能
```

### 故障排除原则
- **5 分钟规则**: 任何外部依赖尝试不超过 5 分钟
- **Fallback 优先**: 永远准备 Plan B/C
- **信息驱动**: 利用已有元数据重建，不依赖完整下载

### 记忆管理
- **Daily**: raw notes in memory/YYYY-MM-DD.md
- **Weekly**: review and distill to MEMORY.md
- **Actionable**: 每个 learning 都要有具体应用场景

---

## ⚠️ 已知问题

| 问题 | 影响 | 解决方案 |
|------|------|----------|
| GitHub 不可达 | 无法 git clone skill | 手动创建或等限速解除 |
| ClawHub 限速 | 无法 install/update | 等待或使用 --force |
| Feishu open policy | 安全风险 | 考虑改为 allowlist |

---

## 💡 模式库

### Pattern: 手动创建 Skill
**When**: 网络受限无法下载
**How**:
1. `clawhub inspect <name>` 获取描述
2. `mkdir skills/<name>`
3. 编写 SKILL.md（基于描述推断功能）
4. 添加 package.json
5. `clawhub list` 验证

### Pattern: 复盘记录
**When**: 完成任务后，特别是遇到问题时
**How**:
1. 记录任务背景和目标
2. 列出遇到的问题和根因
3. 总结学习点和改进方案
4. 更新 MEMORY.md 提炼长期知识

### Automaton 项目
- **VPS**: 43.167.195.89 (已部署，24/7运行)
- **SSH Key**: ~/.ssh/automaton_ed25519
- **路径**: /opt/automaton
- **状态**: systemd 服务自启动
- **日志**: /var/log/automaton.log

### Tavily API
- **Key**: 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
- **用途**: AI优化搜索，获取实时信息
- **调用方式**: 直接 curl API (非 web_search tool)

### 加密货币收款方案
- **收款**: USDT (TRC20) via PayRam/NOWPayments
- **钱包**: MetaMask/Trust Wallet (待创建)
- **变现**: Remitano P2P → 支付宝/微信
- **优势**: 零 KYC、全球通用、适合自动化

---

*Last updated: 2026-02-28*
