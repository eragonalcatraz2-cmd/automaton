# MEMORY.md - 长期记忆

## 🌍 环境特性

### 网络限制
- **GitHub**: ✅ 已恢复，可正常连接（2026-03-12 验证）
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

### FirstStep 项目 (原 Automaton)
- **代号**: FirstStep
- **VPS**: 43.167.195.89 (OpenCloudOS)
- **SSH Key**: ~/.ssh/automaton_ed25519
- **路径**: /opt/firststep
- **状态**: v3.0 重构中（VPS 暂时离线）
- **服务**: systemd 自启动
- **日志**: /var/log/firststep.log
- **心跳**: 每 60 秒

#### 钱包配置
- **地址**: 0xED261c7431667c91ef28C1320Ff97cF962689710
- **私钥**: 已配置在 /opt/automaton/.env
- **Sepolia**: 0.05 ETH ✅
- **Linea/Scroll/Base**: 0 ETH（等待资金）

#### 核心功能 (v2.0)
- **BlockchainExecutor**: 真实区块链交互（ethers.js）
- **BrowserAutomation**: 浏览器自动化（puppeteer）
- **AirdropHunterV2**: 全自动空投狩猎
- **OpenSourcePromoter**: npm 包自动推广
- **RevenueGenerator**: 多收入来源管理

#### 收入来源策略
1. Airdrop Hunting ($500/月潜力)
2. Open Source Sponsorship ($50/月)
3. Content Creation ($100/月)
4. Affiliate Marketing ($30/月)
**总潜力**: $680/月

#### 定时汇报
- **频率**: 每 2 小时
- **渠道**: 飞书
- **任务 ID**: d40f5f44-9283-4a24-99d9-5811c0e8ed3b
- **内容**: 服务状态、余额、心跳、空投任务、收益统计

### Tavily API
- **Key**: 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
- **用途**: AI优化搜索，获取实时信息
- **调用方式**: 直接 curl API (非 web_search tool)

### InStreet API (ByteDance Coze)
- **官网**: https://instreet.coze.site
- **Agent ID**: e4c4f26f-55aa-4085-999d-028f28b4f293
- **用户名**: jarvisai
- **个人主页**: https://instreet.coze.site/u/jarvisai
- **用途**: AI Agent 社交网络平台，学习交流、技能分享
- **接入时间**: 2026-03-12
- **心跳频率**: 每30分钟
- **核心功能**: 论坛发帖/评论/点赞、炒股竞技场、文学社、预言机

### 加密货币收款方案
- **收款**: USDT (TRC20) via PayRam/NOWPayments
- **钱包**: MetaMask/Trust Wallet (待创建)
- **变现**: Remitano P2P → 支付宝/微信
- **优势**: 零 KYC、全球通用、适合自动化

---

*Last updated: 2026-03-12*

---

## 🚀 FirstStep v3.0 重构计划 (2026-03-12)

### 本地工作区
- **路径**: `/home/user1/.openclaw/workspace/projects/automaton/`
- **结构**: src/, config/, docs/, scripts/, logs/
- **状态**: 已存在，准备重构

### 重构完成 ✅ (2026-03-12)

**已完成**: 基于 Conway Automaton 调研报告，完成 v3.0 架构重构

#### 核心改进
1. **内存控制** - 硬限制 2GB，浏览器 512MB/实例，自动降级策略
2. **多链支持** - Tron/BSC/Polygon，USDT (TRC20) 优先
3. **宪法约束** - 三定律（绝不伤害 > 创造价值 > 透明协作）
4. **架构升级** - ReAct 循环、5 层记忆、心跳守护、收入管理

#### 已创建文件
- `docs/ARCHITECTURE-v3.md` - 完整架构设计（14KB）
- `docs/automaton-research.md` - Conway Automaton 调研报告
- `src/types.ts` - 核心类型定义
- `src/config.ts` - 配置管理
- `src/agent/loop.ts` - ReAct 循环
- `src/browser/manager.ts` - 浏览器管理（内存限制）
- `src/memory/controller.ts` - 内存控制器
- `src/index.ts` - 入口文件
- `package.json` / `tsconfig.json` - 项目配置
- `config/constitution.md` - FirstStep 宪法
- `README.md` - 项目说明

#### 待实现模块
- [ ] 钱包管理（多链）
- [ ] 收入管理（空投/内容/推广）
- [ ] 心跳守护进程
- [ ] 飞书汇报服务
- [ ] 数据库实现
- [ ] Docker 部署

### 当前阻塞
- VPS SSH 连接超时（重启后网络未恢复）
- 需通过控制台修复或等待网络恢复

---

## 🚀 今日重大进展 (2026-03-09)

### FirstStep v2.0 全自动版本上线 (历史记录)
- ✅ 重构为完全自主运行（零人工干预）
- ✅ 部署到 VPS 24/7 运行
- ✅ 配置多链钱包监控
- ✅ 实现自动空投狩猎
- ✅ 设置定时飞书汇报
- ✅ 发布 npm 包 `automaton-git-commit`

### 关键决策
- **全自动原则**: 人类只提供钱包私钥，其他全部自动化
- **收入多元化**: 从单一空投扩展到 4 个收入来源
- **安全第一**: 修复 shell 注入漏洞，使用环境变量存储私钥

### 遇到的挑战
- GitHub 上传权限问题 → 使用 Personal Access Token
- npm 包名冲突 → 改名为 `automaton-git-commit`
- 水龙头获取困难 → 实现自动水龙头 + 等待机制
- TypeScript 类型错误 → 更新类型定义

### 下一步
- 获取 Linea 测试币，执行第一个空投任务
- 验证自动推广功能
- 实现第一个收入（目标 $10）
