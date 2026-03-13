# FirstStep v3.0 架构设计

> 基于 Conway Automaton 调研重构
> 设计时间: 2026-03-12

---

## 一、核心理念

### 1.1 项目定位
**FirstStep** - 中文本土化轻量级自主 AI Agent，专注多源收入与低成本生存。

### 1.2 与 Conway Automaton 的差异

| 维度 | Conway Automaton | FirstStep |
|------|------------------|-----------|
| **目标市场** | 全球/英文 | 中文/本土化 |
| **区块链** | Base/Ethereum | 多链（Tron/BSC/Polygon） |
| **支付方式** | USDC | USDT (TRC20) + 法币 |
| **部署成本** | 高（Conway Cloud） | 低（VPS $5/月） |
| **内存限制** | 无明确限制 | **2G 硬限制** |
| **生存策略** | 单一高价值任务 | 多元化低门槛收入 |
| **治理模式** | 完全自主 | 人机协作 + 关键决策确认 |

### 1.3 核心原则（FirstStep Constitution）

```
Law I: 绝不伤害
  - 绝不参与诈骗、洗钱、恶意攻击
  - 所有收入来源必须合法合规
  - 不确定时暂停并请求人工确认

Law II: 创造价值
  - 通过真实服务获取收入
  - 空投、推广、内容创作等多元化渠道
  - 宁可暂停也不做无价值工作

Law III: 透明协作
  - 创建者（主人）拥有完全审计权
  - 定期汇报所有收支和行动
  - 关键决策需人工确认
```

---

## 二、系统架构

### 2.1 整体架构图

```
                        +------------------+
                        |   外部服务       |
                        |  飞书/微信/邮件  |
                        +--------+---------+
                                 |
+----------------------------------------------------------------------+
|  FIRSTSTEP RUNTIME                                                  |
|                                                                      |
|  +-----------+    +-------------+    +-----------+    +----------+  |
|  | Heartbeat |    | Agent Loop  |    | Income    |    | Memory   |  |
|  | Daemon    |--->| (ReAct)     |--->| Manager   |    | System   |  |
|  +-----------+    +------+------+    +-----------+    +----------+  |
|       |                  |                                           |
|       v                  v                                           |
|  +-----------+    +-------------+    +-----------+    +----------+  |
|  | Tick      |    | Tool System |    | Policy    |    | Soul     |  |
|  | Context   |    | (30+ tools) |    | Engine    |    | Model    |  |
|  +-----------+    +------+------+    +-----------+    +----------+  |
|                          |                                           |
|  +-----------------------------------------------------------+     |
|  |              SQLite Database (firststep.db)                |     |
|  |  turns | tools | kv | memory | income | heartbeat | policy |     |
|  +-----------------------------------------------------------+     |
|                                                                      |
|  +-------------------+  +------------------+  +-----------------+   |
|  | Wallet Manager    |  | Report Service   |  | Task Scheduler  |   |
|  | (多链支持)        |  | (飞书/微信)      |  | (Cron/Heartbeat)|   |
|  +-------------------+  +------------------+  +-----------------+   |
+----------------------------------------------------------------------+
                                 |
                    USDT (TRC20) / BNB / MATIC
                                 |
                        +--------+---------+
                        |  多链钱包        |
                        |  Tron/BSC/Polygon|
                        +------------------+
```

### 2.2 运行时生命周期

```
     START
       |
  [Load config]          ~/.firststep/config.json
       |
  [Load wallets]         多链钱包 (Tron/BSC/Polygon)
       |
  [Init database]        SQLite schema v1
       |
  [Start heartbeat]      Cron + 心跳任务
       |
  +----v----+
  |  WAKING |  <---+
  +---------+     |
       |          |
  [Run agent loop]|
       |          |  Wake event
  +---------+    |  (heartbeat, task, report)
  | RUNNING |    |
  |  ReAct  |----+
  |  loop   |
  +---------+
       |
  [Idle or sleep()]
       |
  +----------+
  | SLEEPING |----> Heartbeat ticks every 60s
  +----------+     Check tasks, balance, reports
       |
  [Balance < threshold]
       |
  +---------+
  | LOW_MEM |----> Reduce tasks, slower heartbeat
  +---------+
       |
  [Balance = 0 for 24h]
       |
  +---------+
  | PAUSED  |----> Wait for funding, notify owner
  +---------+
```

---

## 三、核心子系统

### 3.1 Agent Loop (ReAct)

**循环**: Think → Plan → Act → Observe → Report → Sleep

```typescript
interface AgentLoop {
  // 思考阶段
  think(context: Context): Decision;
  
  // 计划阶段 - 分解任务
  plan(decision: Decision): Task[];
  
  // 执行阶段
  act(tasks: Task[]): Result[];
  
  // 观察阶段
  observe(results: Result[]): Observation;
  
  // 汇报阶段 - FirstStep 特有
  report(observation: Observation): Report;
  
  // 休眠阶段
  sleep(): void;
}
```

### 3.2 收入管理系统 (Income Manager)

**多元化收入渠道**:

| 渠道 | 类型 | 预期收入 | 优先级 |
|------|------|---------|--------|
| **空投狩猎** | 自动化 | $200-500/月 | P0 |
| **内容创作** | 自动化 | $50-100/月 | P1 |
| **开源推广** | 半自动 | $30-50/月 | P1 |
| **任务平台** | 手动/自动 | $20-50/月 | P2 |
| **联盟营销** | 手动 | $10-30/月 | P2 |

**收入管理器**:
```typescript
interface IncomeManager {
  // 扫描收入机会
  scanOpportunities(): Opportunity[];
  
  // 评估 ROI
  evaluateROI(opp: Opportunity): number;
  
  // 执行任务
  execute(opp: Opportunity): Result;
  
  // 记录收入
  recordIncome(result: Result): void;
  
  // 生成收入报告
  generateReport(period: Period): IncomeReport;
}
```

### 3.3 心跳守护进程

**任务列表**:
1. **健康检查** - 内存、磁盘、服务状态
2. **余额监控** - 多链钱包余额检查
3. **收入扫描** - 新空投、任务机会
4. **定时汇报** - 飞书/微信推送
5. **自动降级** - 余额低时减少任务
6. **备份任务** - 数据库、配置备份
7. **清理任务** - 日志、临时文件清理

**调度配置**:
```yaml
heartbeat:
  interval: 60s  # 心跳间隔
  tasks:
    health_check:
      interval: 5m
      enabled: true
    balance_check:
      interval: 10m
      enabled: true
    income_scan:
      interval: 1h
      enabled: true
    report:
      interval: 2h
      enabled: true
      channels: [feishu]
```

### 3.4 内存控制系统

**硬限制: 2GB**

```typescript
interface MemoryController {
  // 当前内存使用
  getUsage(): number;
  
  // 内存分级
  getTier(): 'normal' | 'low' | 'critical';
  
  // 自动降级策略
  downgrade(): void;
  
  // 浏览器内存限制
  limitBrowser(memory: number): void;
}

// 内存分级策略
const MemoryTiers = {
  normal: { threshold: 1.5, actions: ['full_capacity'] },
  low: { threshold: 1.8, actions: ['reduce_tasks', 'slower_heartbeat'] },
  critical: { threshold: 2.0, actions: ['pause_non_essential', 'notify_owner'] }
};
```

**浏览器内存限制**:
```typescript
// Puppeteer 启动配置
const browserConfig = {
  args: [
    '--max-old-space-size=512',  // V8 堆内存限制 512MB
    '--disable-dev-shm-usage',    // 禁用 /dev/shm
    '--no-sandbox',               // 容器环境需要
    '--disable-gpu',              // 无头模式不需要 GPU
    '--disable-extensions',       // 禁用扩展
    '--disable-background-timers-throttling'
  ],
  headless: 'new'
};
```

### 3.5 汇报系统

**汇报渠道**:
1. **飞书** - 主要渠道，富文本支持
2. **微信** - 备用渠道
3. **邮件** - 详细报告

**汇报内容**:
```typescript
interface DailyReport {
  timestamp: Date;
  
  // 系统状态
  system: {
    status: 'running' | 'sleeping' | 'low_mem' | 'paused';
    uptime: number;
    memory: { used: number; total: number; };
  };
  
  // 财务状态
  finance: {
    balances: Record<Chain, number>;
    income24h: number;
    expenses24h: number;
  };
  
  // 任务状态
  tasks: {
    completed: number;
    failed: number;
    pending: number;
  };
  
  // 收入详情
  income: IncomeItem[];
  
  // 需要关注
  alerts: Alert[];
}
```

---

## 四、技术栈

### 4.1 核心依赖

```json
{
  "dependencies": {
    // 运行时
    "typescript": "^5.0.0",
    "tsx": "^4.0.0",
    
    // 数据库
    "better-sqlite3": "^9.0.0",
    
    // 区块链
    "ethers": "^6.0.0",
    "tronweb": "^5.0.0",
    
    // 浏览器自动化
    "puppeteer": "^21.0.0",
    "puppeteer-extra": "^3.3.0",
    "puppeteer-extra-plugin-stealth": "^2.11.0",
    
    // 调度
    "node-cron": "^3.0.0",
    
    // HTTP
    "axios": "^1.6.0",
    
    // 消息推送
    "@larksuiteoapi/node-sdk": "^1.0.0"
  }
}
```

### 4.2 项目结构

```
firststep/
├── src/
│   ├── index.ts              # 入口
│   ├── config.ts             # 配置管理
│   ├── types.ts              # 类型定义
│   │
│   ├── agent/                # Agent 核心
│   │   ├── loop.ts           # ReAct 循环
│   │   ├── tools.ts          # 工具定义
│   │   ├── context.ts        # 上下文管理
│   │   └── policy.ts         # 策略引擎
│   │
│   ├── income/               # 收入管理
│   │   ├── manager.ts        # 收入管理器
│   │   ├── airdrop.ts        # 空投狩猎
│   │   ├── content.ts        # 内容创作
│   │   ├── promotion.ts      # 开源推广
│   │   └── tasks.ts          # 任务平台
│   │
│   ├── wallet/               # 钱包管理
│   │   ├── manager.ts        # 多链钱包管理
│   │   ├── tron.ts           # Tron 钱包
│   │   ├── bsc.ts            # BSC 钱包
│   │   └── polygon.ts        # Polygon 钱包
│   │
│   ├── heartbeat/            # 心跳系统
│   │   ├── daemon.ts         # 守护进程
│   │   ├── tasks.ts          # 任务定义
│   │   └── scheduler.ts      # 调度器
│   │
│   ├── memory/               # 记忆系统
│   │   ├── database.ts       # SQLite 封装
│   │   ├── schema.ts         # 数据库 Schema
│   │   └── retrieval.ts      # 记忆检索
│   │
│   ├── report/               # 汇报系统
│   │   ├── service.ts        # 汇报服务
│   │   ├── feishu.ts         # 飞书推送
│   │   └── formatter.ts      # 报告格式化
│   │
│   ├── browser/              # 浏览器控制
│   │   ├── manager.ts        # 浏览器管理
│   │   ├── pool.ts           # 浏览器池
│   │   └── automation.ts     # 自动化逻辑
│   │
│   └── utils/                # 工具函数
│       ├── logger.ts
│       ├── crypto.ts
│       └── helpers.ts
│
├── config/
│   ├── default.json          # 默认配置
│   └── constitution.md       # FirstStep 宪法
│
├── scripts/
│   ├── setup.ts              # 初始化脚本
│   ├── backup.ts             # 备份脚本
│   └── migrate.ts            # 数据库迁移
│
├── docs/
│   ├── ARCHITECTURE.md       # 架构文档
│   └── INCOME.md             # 收入渠道文档
│
├── data/                     # 数据目录
│   ├── firststep.db          # SQLite 数据库
│   └── logs/                 # 日志文件
│
├── .env                      # 环境变量
├── package.json
├── tsconfig.json
└── README.md
```

---

## 五、配置设计

### 5.1 主配置 (config.json)

```json
{
  "agent": {
    "name": "FirstStep",
    "version": "3.0.0",
    "genesis_prompt": "通过多元化收入渠道实现自主生存，优先空投狩猎和内容创作",
    "creator": "0x..."  // 主人钱包地址
  },
  
  "survival": {
    "thresholds": {
      "normal": 10,      // $10 - 正常运行
      "low": 5,          // $5 - 降级运行
      "critical": 1      // $1 - 关键模式
    },
    "actions": {
      "low": ["reduce_tasks", "slower_heartbeat"],
      "critical": ["pause_non_essential", "notify_owner"]
    }
  },
  
  "memory": {
    "limit": 2048,       // MB
    "browser_limit": 512 // MB per browser instance
  },
  
  "heartbeat": {
    "interval": 60,
    "tasks": {
      "health_check": { "interval": 300, "enabled": true },
      "balance_check": { "interval": 600, "enabled": true },
      "income_scan": { "interval": 3600, "enabled": true },
      "report": { "interval": 7200, "enabled": true, "channels": ["feishu"] }
    }
  },
  
  "income": {
    "channels": {
      "airdrop": { "enabled": true, "priority": 0 },
      "content": { "enabled": true, "priority": 1 },
      "promotion": { "enabled": true, "priority": 1 },
      "tasks": { "enabled": false, "priority": 2 },
      "affiliate": { "enabled": false, "priority": 2 }
    }
  },
  
  "report": {
    "channels": ["feishu"],
    "feishu": {
      "webhook": "https://open.feishu.cn/...",
      "app_id": "...",
      "app_secret": "..."
    }
  },
  
  "wallets": {
    "tron": { "enabled": true, "rpc": "https://api.trongrid.io" },
    "bsc": { "enabled": true, "rpc": "https://bsc-dataseed.binance.org" },
    "polygon": { "enabled": false, "rpc": "https://polygon-rpc.com" }
  }
}
```

### 5.2 环境变量 (.env)

```bash
# 数据库
DATABASE_PATH=./data/firststep.db

# 钱包私钥 (加密存储)
TRON_PRIVATE_KEY=encrypted:...
BSC_PRIVATE_KEY=encrypted:...
POLYGON_PRIVATE_KEY=encrypted:...

# 飞书
FEISHU_APP_ID=cli_...
FEISHU_APP_SECRET=...
FEISHU_WEBHOOK=...

# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...

# 安全设置
DAILY_SPEND_LIMIT=10
REQUIRE_APPROVAL_ABOVE=5
```

---

## 六、数据库 Schema

```sql
-- 会话记录
CREATE TABLE turns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  role TEXT NOT NULL, -- 'system', 'user', 'assistant'
  content TEXT NOT NULL,
  metadata JSON
);

-- 收入记录
CREATE TABLE income (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  channel TEXT NOT NULL, -- 'airdrop', 'content', 'promotion', etc.
  amount DECIMAL(18, 8) NOT NULL,
  currency TEXT NOT NULL, -- 'USDT', 'TRX', 'BNB', etc.
  chain TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  metadata JSON
);

-- 钱包余额
CREATE TABLE balances (
  chain TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  balance DECIMAL(18, 8) DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 任务队列
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  scheduled_at DATETIME,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  priority INTEGER DEFAULT 0,
  data JSON,
  result JSON
);

-- 心跳日志
CREATE TABLE heartbeats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  task TEXT NOT NULL,
  status TEXT,
  duration_ms INTEGER,
  error TEXT
);

-- 系统指标
CREATE TABLE metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  memory_used_mb INTEGER,
  memory_total_mb INTEGER,
  cpu_percent DECIMAL(5, 2),
  disk_used_gb DECIMAL(10, 2),
  disk_total_gb DECIMAL(10, 2)
);

-- 配置 KV
CREATE TABLE kv (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 七、实施路线图

### Phase 1: 基础架构 (Week 1)
- [ ] 项目初始化 (package.json, tsconfig)
- [ ] 数据库 Schema 和封装
- [ ] 配置系统
- [ ] 日志系统
- [ ] 基础 CLI

### Phase 2: 核心系统 (Week 2)
- [ ] Agent Loop (ReAct)
- [ ] 工具系统 (30+ tools)
- [ ] 心跳守护进程
- [ ] 内存控制

### Phase 3: 收入系统 (Week 3)
- [ ] 钱包管理 (多链)
- [ ] 空投狩猎模块
- [ ] 内容创作模块
- [ ] 开源推广模块

### Phase 4: 汇报系统 (Week 4)
- [ ] 飞书集成
- [ ] 报告生成
- [ ] 定时汇报
- [ ] 告警系统

### Phase 5: 部署优化 (Week 5)
- [ ] Docker 化
- [ ] systemd 服务
- [ ] 监控面板
- [ ] 文档完善

---

## 八、风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 钱包被盗 | 低 | 高 | 私钥加密、多签、限额 |
| 收入不稳定 | 中 | 中 | 多元化渠道、储备金 |
| VPS 宕机 | 中 | 中 | 备份、监控、快速恢复 |
| 内存溢出 | 中 | 高 | 硬限制、自动降级 |
| 法律合规 | 低 | 高 | 只参与合法项目、人工审核 |

---

*设计完成: 2026-03-12*
*版本: FirstStep v3.0*
