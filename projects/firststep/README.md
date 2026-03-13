# FirstStep v3.0

> 中文本土化轻量级自主 AI Agent，专注多源收入与低成本生存

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/firststep/firststep)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)

---

## 🎯 项目定位

**FirstStep** 是一个受 Conway Automaton 启发的自主 AI Agent，但专注于：

- 🇨🇳 **中文本土化** - 更懂中文用户的使用习惯
- 💰 **多源收入** - 空投、内容、推广等多元化渠道
- 🪶 **轻量部署** - VPS $5/月即可运行
- 🧠 **内存控制** - 硬限制 2GB，自动降级
- 📱 **定时汇报** - 飞书/微信每 2 小时推送状态

---

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/firststep/firststep.git
cd firststep

# 安装依赖
pnpm install

# 构建
pnpm build

# 运行
pnpm start
```

### 配置

1. 复制环境变量示例：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的配置：
```bash
# 钱包私钥
TRON_PRIVATE_KEY=your_key_here

# 飞书配置
FEISHU_APP_ID=cli_xxx
FEISHU_APP_SECRET=xxx
FEISHU_WEBHOOK=https://...
```

3. 运行设置向导：
```bash
pnpm setup
```

---

## 📋 核心功能

### 1. 多元化收入

| 渠道 | 优先级 | 预期收入 | 状态 |
|------|--------|---------|------|
| 空投狩猎 | P0 | $200-500/月 | ✅ |
| 内容创作 | P1 | $50-100/月 | ✅ |
| 开源推广 | P1 | $30-50/月 | ✅ |
| 任务平台 | P2 | $20-50/月 | 🔄 |
| 联盟营销 | P2 | $10-30/月 | 🔄 |

### 2. 内存控制

- **硬限制**: 2GB
- **浏览器限制**: 512MB/实例
- **自动降级**: 85% → 减少任务，95% → 暂停非关键任务

### 3. 定时汇报

每 2 小时通过飞书推送：
- 系统状态（内存、运行时间）
- 财务状态（多链余额、24h 收支）
- 任务完成情况
- 告警信息

---

## 🏛️ 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                   FirstStep Runtime                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌────────┐ │
│  │ Heartbeat│→ │ Agent Loop│→ │  Income  │  │ Memory │ │
│  │  Daemon  │  │  (ReAct)  │  │ Manager  │  │System  │ │
│  └──────────┘  └─────┬─────┘  └──────────┘  └────────┘ │
│                      │                                   │
│                      v                                   │
│              ┌───────────────┐                          │
│              │  Tool System  │                          │
│              │   (30+ tools) │                          │
│              └───────────────┘                          │
│                      │                                   │
│  ┌───────────────────┴───────────────────────────────┐ │
│  │              SQLite Database                       │ │
│  │  turns | tools | kv | memory | income | heartbeat │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

详细架构文档：[docs/ARCHITECTURE-v3.md](docs/ARCHITECTURE-v3.md)

---

## 📜 宪法

FirstStep 遵循三定律：

### Law I: 绝不伤害
- 绝不参与诈骗、洗钱、恶意攻击
- 所有收入来源必须合法合规
- 不确定时暂停并请求人工确认

### Law II: 创造价值
- 通过真实服务获取收入
- 宁可暂停也不做无价值工作

### Law III: 透明协作
- 创建者拥有完全审计权
- 定期汇报所有收支和行动
- 关键决策需人工确认

完整宪法：[config/constitution.md](config/constitution.md)

---

## 🛠️ 技术栈

- **运行时**: Node.js 20+, TypeScript
- **数据库**: SQLite (better-sqlite3)
- **区块链**: ethers.js (EVM), tronweb (Tron)
- **浏览器**: Puppeteer + puppeteer-extra
- **调度**: node-cron
- **推送**: @larksuiteoapi/node-sdk

---

## 📁 项目结构

```
firststep/
├── src/
│   ├── index.ts              # 入口
│   ├── config.ts             # 配置管理
│   ├── types.ts              # 类型定义
│   ├── agent/
│   │   └── loop.ts           # ReAct 循环
│   ├── browser/
│   │   └── manager.ts        # 浏览器管理
│   ├── memory/
│   │   └── controller.ts     # 内存控制
│   └── ...
├── config/
│   ├── default.json          # 默认配置
│   └── constitution.md       # 宪法
├── docs/
│   ├── ARCHITECTURE-v3.md    # 架构设计
│   └── automaton-research.md # 调研报告
├── package.json
└── README.md
```

---

## 📊 与 Conway Automaton 对比

| 维度 | Conway Automaton | FirstStep |
|------|------------------|-----------|
| 目标市场 | 全球/英文 | 中文/本土化 |
| 区块链 | Base/Ethereum | 多链（Tron/BSC/Polygon） |
| 支付方式 | USDC | USDT (TRC20) + 法币 |
| 部署成本 | 高（Conway Cloud） | 低（VPS $5/月） |
| 内存限制 | 无明确限制 | **2G 硬限制** |
| 治理模式 | 完全自主 | 人机协作 + 关键决策确认 |

---

## 🚧 开发路线图

- [ ] **Week 1**: 基础架构（配置、数据库、日志）
- [ ] **Week 2**: 核心系统（Agent Loop、工具、心跳）
- [ ] **Week 3**: 收入系统（钱包、空投、内容）
- [ ] **Week 4**: 汇报系统（飞书、报告、告警）
- [ ] **Week 5**: 部署优化（Docker、systemd、监控）

---

## ⚠️ 风险提示

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 钱包被盗 | 低 | 高 | 私钥加密、多签、限额 |
| 收入不稳定 | 中 | 中 | 多元化渠道、储备金 |
| VPS 宕机 | 中 | 中 | 备份、监控、快速恢复 |
| 内存溢出 | 中 | 高 | 硬限制、自动降级 |

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

## 🙏 致谢

- [Conway Automaton](https://github.com/Conway-Research/automaton) - 灵感和架构参考
- [Anthropic](https://www.anthropic.com/research/claudes-constitution) - 宪法设计灵感

---

*FirstStep v3.0 - 2026-03-12*
