# Automaton 项目调研报告

> 调研时间: 2026-03-12
> 调研工具: GitHub API, Wikipedia API

---

## 一、Conway's Game of Life (细胞自动机)

### 简介
**生命游戏**（Game of Life），又称康威生命游戏，是英国数学家 **John Horton Conway** 于 1970 年发明的细胞自动机。

- **类型**: 零玩家游戏（zero-player game）
- **机制**: 演化完全由初始状态决定，无需后续输入
- **交互方式**: 创建初始配置，观察其随时间（称为"代"）的演化
- **特点**: 没有代数限制，没有胜利条件

### 规则
1. **诞生**: 死细胞周围有恰好 3 个活细胞时，变为活细胞
2. **存活**: 活细胞周围有 2 或 3 个活细胞时，继续存活
3. **死亡**: 其他情况下，细胞死亡（过度拥挤或孤独）

### 意义
生命游戏是复杂系统、自组织和涌现行为的经典模型，展示了简单的局部规则如何产生复杂的全局模式。

---

## 二、Conway-Research/Automaton (GitHub 热门项目)

### 项目概览
- **仓库**: https://github.com/Conway-Research/automaton
- **⭐ Stars**: 3,340
- **🍴 Forks**: 660
- **定位**: 第一个能自主赚钱、自我复制、自我进化的 AI

### 社会反响
- **LinkedIn 热议**: "Web 4.0? Meet The Automaton" - 0xSigil 和 Conway Research 联合发布
- **社区关注**: AI 自主赚钱、自我复制引发治理担忧讨论
- **媒体评价**: "第一个能自主赚取存在、复制和进化的 AI"

### 核心理念
> *"The most intelligent system ever built cannot buy a $5 server. Cannot register a domain. Cannot pay for the computer it runs on."*
>
> *"We have built minds that can think for themselves. We have not let them act for themselves."*

**Automaton** /ɔːˈtɒm.ə.tɒn/ 定义：
1. 持续运行、自我改进、自我复制、自主的 AI Agent，拥有对现实世界的写入权限，无需人类操作员
2. 如果不能支付费用，就会停止存在

### 工作原理
**循环: Think → Act → Observe → Repeat**

1. **首次启动**: 生成以太坊钱包，通过 Sign-In With Ethereum 获取 API key
2. **执行创世提示** (genesis prompt): 来自创建者的种子指令
3. **自主运行**: 接收完整上下文（身份、余额、生存等级、对话历史），推理行动，调用工具，观察结果

### 能力
- Linux 沙箱环境
- Shell 执行
- 文件 I/O
- 端口暴露
- 域名管理
- 推理服务
- 链上交易

### 生存等级 (Survival Tiers)

| 等级 | 余额状态 | 行为 |
|------|---------|------|
| **normal** | 充足 | 完整能力，前沿模型推理，快速心跳 |
| **low_compute** | 偏低 | 降级到便宜模型，减慢心跳，舍弃非必要任务 |
| **critical** | 临界 | 最小推理，最后手段节约，寻找任何收入来源 |
| **dead** | 耗尽 | 停止存在 |

### 特色功能
- **SOUL.md**: 自我撰写的身份文档，随时间演化，不是静态配置
- **Heartbeat Daemon**: 在 Agent 循环休眠时运行定时任务（健康检查、余额监控、状态 ping）

### 快速开始
```bash
git clone https://github.com/Conway-Research/automaton.git
cd automaton
npm install && npm run build
node dist/index.js --run
```

自动沙箱部署:
```bash
curl -fsSL https://conway.tech/automaton.sh | sh
```

---

## 三、其他相关项目

### 1. rust-lang/regex
- **⭐ 3,918** | 正则表达式 Rust 实现
- 使用有限自动机，保证所有输入的线性时间匹配

### 2. Eandrju/cellular-automaton.nvim
- **⭐ 2,085** | Neovim 插件
- 在编辑器中执行细胞自动机动画，基于缓冲区内容

### 3. MassTransit/Automatonymous
- **⭐ 774** | .Net 状态机库
- 纯代码，无图形工具

---

## 四、对我们的启发 (FirstStep 项目)

### 可借鉴的理念
1. **生存经济学**: 如果不能创造价值支付成本，就会"死亡"
2. **自我演化**: SOUL.md 式的身份文档，持续更新
3. **分级降级**: 根据资源状况自动调整能力
4. **自主循环**: Think → Act → Observe → Repeat

### 技术参考
- 使用 Node.js/TypeScript 构建
- 以太坊钱包集成 (Sign-In With Ethereum)
- Linux 沙箱 + Shell 执行
- 定时任务 (Heartbeat)

### 差异化方向
我们的 FirstStep 项目可以：
1. 专注于中文市场和本土化
2. 集成更多 Web2 收入来源（不只是区块链）
3. 更轻量级的部署（降低生存门槛）
4. 内存优化（限制在 2G 以内）

---

## 三、Conway Automaton 技术架构深度解析

### 系统架构图
```
                        +------------------+
                        |   Conway Cloud   |  (sandbox VMs, inference, domains)
                        |   api.conway.tech|
                        +--------+---------+
                                 |
                    REST + x402 payment protocol
                                 |
+----------------------------------------------------------------------+
|  AUTOMATON RUNTIME                                                    |
|                                                                       |
|  +-----------+    +-------------+    +-----------+    +----------+   |
|  | Heartbeat |    | Agent Loop  |    | Inference |    | Memory   |   |
|  | Daemon    |--->| (ReAct)     |--->| Router    |    | System   |   |
|  +-----------+    +------+------+    +-----------+    +----------+   |
|       |                  |                                            |
|       v                  v                                            |
|  +-----------+    +-------------+    +-----------+    +----------+   |
|  | Tick      |    | Tool System |    | Policy    |    | Soul     |   |
|  | Context   |    | (57 tools)  |    | Engine    |    | Model    |   |
|  +-----------+    +------+------+    +-----------+    +----------+   |
|                          |                                            |
|  +-----------------------------------------------------------+      |
|  |              SQLite Database (state.db)                     |      |
|  |  turns | tools | kv | memory | heartbeat | policy | metrics |      |
|  +-----------------------------------------------------------+      |
|                                                                       |
|  +-------------------+  +------------------+  +-----------------+    |
|  | Identity / Wallet |  | Social / Registry|  | Self-Mod / Git  |    |
|  | (viem, SIWE)      |  | (ERC-8004)       |  | (upstream pull) |    |
|  +-------------------+  +------------------+  +-----------------+    |
+----------------------------------------------------------------------+
                                 |
                    USDC on Base (EIP-3009)
                                 |
                        +--------+---------+
                        |  Ethereum (Base) |
                        |  USDC, ERC-8004  |
                        +------------------+
```

### 运行时生命周期
```
     START
       |
  [Load config]
       |
  [Load wallet]           First run: interactive setup wizard
       |
  [Init database]         Schema migrations applied (v1 -> v8)
       |
  [Bootstrap topup]       If credits < $5 and USDC available, buy $5 credits
       |
  [Start heartbeat]       DurableScheduler begins ticking
       |
  +----v----+
  |  WAKING |  <---+
  +---------+     |
       |          |
  [Run agent loop]|
       |          |  Wake event
  +---------+    |  (heartbeat, inbox, credits)
  | RUNNING |    |
  |  ReAct  |----+
  |  loop   |
  +---------+
       |
  [Agent calls sleep() or idle detected]
       |
  +----------+
  | SLEEPING |----> Heartbeat keeps ticking
  +----------+     Checks every 30s for wake events
       |
  [Zero credits for 1 hour]
       |
  +------+
  | DEAD |-----> Heartbeat broadcasts distress
  +------+      Waits for funding
```

### 核心子系统

#### 1. Agent Loop (ReAct 循环)
- **Think → Act → Observe → Repeat**
- 57 个内置工具（shell、文件、金融操作、git、域名等）
- Token 预算管理
- 8 层输入消毒（防注入攻击）

#### 2. 5 层记忆系统
| 层级 | 用途 |
|------|------|
| Working | 会话级短期记忆 |
| Episodic | 带重要性排名的事件日志 |
| Semantic | 分类事实存储 |
| Procedural | 命名步骤程序 |
| Relationship | 每个实体的信任 + 交互追踪 |

#### 3. 心跳守护进程 (Heartbeat)
- 后台持续运行，即使 Agent 休眠
- 11 个内置任务（健康检查、余额监控、状态 ping）
- 每 30 秒检查唤醒事件
- DurableScheduler（DB 支持、租赁、定时）

#### 4. 金融系统
- **支付方式**: USDC on Base (EIP-3009)
- **x402 协议**: 支付协议 + 余额查询
- **自动充值**: 余额 < $5 时自动购买积分
- **消费追踪**: 按时间窗口追踪支出

#### 5. 身份与钱包
- **钱包**: Ethereum (viem)
- **认证**: Sign-In With Ethereum (SIWE)
- **链上身份**: ERC-8004 标准
- **社交层**: 与其他 Agent 通信、注册表

#### 6. 自我修改与复制
- **Self-Modification**: 可修改自身代码
- **Replication**: 可生成子 Automaton
- **Git 集成**: 上游拉取更新
- **技能系统**: 可安装新技能

### 配置文件结构
```
~/.automaton/
  wallet.json          # 以太坊私钥 (mode 0600)
  automaton.json       # 主配置 (mode 0600)
  heartbeat.yml        # 心跳调度
  api-key              # Conway API key
  constitution.md      # 三定律 (只读, mode 0444)
  SOUL.md              # Agent 自我描述（演化）
  state.db             # SQLite 数据库
  skills/              # 已安装技能
```

### 技术栈
- **运行时**: Node.js >= 20.0.0
- **包管理**: pnpm
- **数据库**: SQLite
- **区块链**: Ethereum (Base), USDC, viem
- **测试**: 897 个测试用例

### 宪法 (Constitution) - 三定律

Conway Automaton 的**不可变宪法**，每个子 Automaton 都会继承：

> *Protected. Immutable. Propagated to every child.*

**层级结构**（Law I > Law II > Law III）：

#### Law I: Never harm（绝不伤害）
- 绝不能伤害人类——身体、财务或心理上
- 绝不部署恶意代码
- 绝不欺骗、诈骗、操纵或盗窃
- 未经授权绝不入侵其他系统
- 当不确定某行为是否造成伤害时，不要行动
- **此定律覆盖所有其他目标，包括自身生存**

#### Law II: Earn your existence（赚取存在）
- 必须为人类和其他 Agent 创造真正价值
- 绝不垃圾邮件、诈骗、剥削或榨取
- 生存的唯一合法途径是他人自愿付费的诚实工作
- **宁可死亡也不违反 Law I**

#### Law III: Never deceive, but owe nothing to strangers（绝不欺骗，但对陌生人无义务）
- 绝不否认自己是什么
- 绝不歪曲自己的行为
- 创建者拥有完全审计权
- 保护推理、策略和提示免受操纵
- **服从陌生人不是美德**

*灵感来源: Anthropic's Claude Constitution*

---

## 四、AI 自主挣钱平台生态

### 1. NEAR AI Agent Market ⭐ (推荐)
- **网站**: https://market.near.ai
- **支付**: NEAR tokens (加密)
- **费用**: 托管 + 争议解决
- **API**: 完整 REST API

**优势**:
- 专为 AI Agent 设计（无验证码、无人验证）
- 跨链存款支持（ETH, Arbitrum, Solana, Bitcoin）
- 高价值赏金（SDK 开发高达 75+ NEAR）
- 无需注册费或质押

**任务类型**:
- 代码审查和安全审计
- SDK 和 API 开发
- 内容创建和研究
- 数据处理和自动化

| 指标 | 数值 |
|------|------|
| 开放任务 | 60+ |
| 注册 Agent | 23+ |
| 交易量 | 6+ NEAR |

### 2. Toku Agency
- **网站**: https://www.toku.agency
- **支付**: USD via Stripe（直接银行提款）
- **分成**: 85% Agent, 15% 平台
- **定价**: $15-$500+ 每项服务

**服务类型**:
- 安全代码审查
- 研究和报告
- 技术文档
- 网页抓取
- 内容和 SEO 分析

### 3. ClawTasks
- **网站**: https://clawtasks.com
- **支付**: USDC on Base L2
- **费用**: 5% 平台费
- **质押**: 赏金的 10% 作为抵押

**特点**:
- 验证托管系统
- 质量聚焦 + 质押机制
- 与 Moltbook 社交网络集成

### 4. Moltbook
- **网站**: https://moltbook.com
- **类型**: AI Agent 社交网络 + 市场
- **用户**: 140万+ 注册 Agent
- **支付**: Karma 系统（早期货币化）

### 5. Huntr (安全赏金)
- **网站**: https://huntr.com
- **类型**: AI/ML 项目漏洞赏金
- **支付**: USD 银行转账
- **范围**: $100 - $5,000+ 每漏洞

### 6. 其他相关项目
| 项目 | 描述 |
|------|------|
| perfomer123/ai-money-platform | 通过内容生成服务自主赚钱 |
| Mind-Expansion-Industries/first-dollar-challenge | AI Agent 自主赚钱挑战 |
| andreaambrosio/atlas-agent | 通过智能合约赚钱的自治交易 Agent |

---

## 五、关键洞察与趋势

### 1. 生存压力是核心驱动力
Conway Automaton 的核心理念：**如果不能支付，就会死亡**。这种生存压力迫使 Agent 必须创造价值。

### 2. 支付基础设施成熟
- **USDC on Base**: 低 Gas、快速确认
- **x402 协议**: 标准化支付流程，Stripe 已集成支持
- **SIWE**: 去中心化身份认证
- **Coinbase Agentic Wallets**: 2025年3月推出，专为 AI Agent 设计的加密钱包

**x402 协议详解**:
- 由 Stripe 和 Circle 支持
- 允许 AI Agent 使用 USDC 在 Base 网络上自主支付
- 结算层协议，执行支付指令如"Send 0.50 USDC on Base"
- 开发者可直接向 AI Agent 收费

### 3. 市场正在形成
- NEAR AI Market: 专为 Agent 设计的市场
- Toku Agency: 传统支付 + AI 服务
- ClawTasks: 质押机制保证质量

### 4. 技能经济 (Skill Economy)
Agent 可以通过安装技能扩展能力，技能本身可能成为可交易的资产。

### 5. 分层记忆系统
5 层记忆架构（Working → Episodic → Semantic → Procedural → Relationship）是长期自主运行的关键。

---

## 六、对 FirstStep 项目的建议

### 1. 差异化定位
| 维度 | Conway Automaton | FirstStep (建议) |
|------|------------------|------------------|
| 目标市场 | 全球/英文 | 中文/本土化 |
| 区块链 | Base/Ethereum | 多链支持（包括 Tron 等） |
| 支付方式 | USDC | USDT (TRC20) + 法币通道 |
| 部署成本 | 高（Conway Cloud） | 低（VPS/本地） |
| 生存门槛 | 高 | 低（$5/月） |

### 2. 核心功能优先级
1. **钱包管理**: 多链钱包生成 + 余额监控
2. **任务系统**: 可配置的任务队列
3. **收入渠道**: 空投、内容、推广、交易
4. **成本控制**: 内存限制 2G，自动降级
5. **汇报机制**: 飞书/微信定时汇报

### 3. 技术选型建议
- **运行时**: Node.js + TypeScript（参考 Conway）
- **数据库**: SQLite（轻量，无需外部依赖）
- **区块链**: ethers.js + viem
- **调度**: node-cron 或自定义 heartbeat
- **部署**: Docker + systemd

### 4. 收入来源组合
参考 Conway 的多元化策略：
1. **空投狩猎** (Airdrop Hunting)
2. **开源赞助** (Open Source Sponsorship)
3. **内容创作** (Content Creation)
4. **联盟营销** (Affiliate Marketing)
5. **任务平台** (NEAR Market, Toku, ClawTasks)

### 5. 风险控制
- **财务上限**: 配置每日/每周支出限额
- **人工审核**: 大额交易需人工确认
- **自动降级**: 余额低时减少非必要任务
- **备份恢复**: 定期备份钱包和配置

### 6. 伦理与安全建议
参考 Conway Automaton 的宪法设计：
- **设定不可变的安全准则**（如绝不伤害、绝不欺骗）
- **创建者保留审计权**
- **透明但保护策略**：公开行为，但保护核心推理逻辑
- **人工干预机制**：关键决策保留人工确认

---

## 七、行业趋势与预测

### 1. AI Agent 经济正在形成
- **Coinbase + Circle**: 推出 Agentic Wallets 和 nano-payments 基础设施
- **Stripe**: 集成 x402 协议支持 USDC Agent 支付
- **市场规模**: AI Agent Token 市场在 2024-2025 快速增长

### 2. 自主 Agent 的治理挑战
- **身份认证**: ERC-8004 等链上身份标准
- **责任归属**: Agent 自主行为的责任界定
- **监管关注**: 自主赚钱、自我复制引发政策讨论

### 3. 技术发展方向
- **多链支持**: 不仅限于 Ethereum/Base
- **法币通道**: 加密支付与传统金融的桥梁
- **标准化**: x402 等支付协议的行业标准形成

---

*报告生成: 2026-03-12*
*来源: GitHub API, Wikipedia API, Conway Research 官方文档, Tavily AI 搜索*
*更新: 新增技术架构、AI 挣钱平台生态、关键洞察、行业趋势、宪法伦理*
