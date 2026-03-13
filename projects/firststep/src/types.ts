// FirstStep v3.0 - Core Types

export interface AgentConfig {
  name: string;
  version: string;
  genesis_prompt: string;
  creator: string;
}

export interface SurvivalConfig {
  thresholds: {
    normal: number;
    low: number;
    critical: number;
  };
  actions: {
    low: string[];
    critical: string[];
  };
}

export interface MemoryConfig {
  limit: number; // MB
  browser_limit: number; // MB per instance
}

export interface HeartbeatTask {
  interval: number; // seconds
  enabled: boolean;
  channels?: string[];
}

export interface HeartbeatConfig {
  interval: number;
  tasks: Record<string, HeartbeatTask>;
}

export interface IncomeChannel {
  enabled: boolean;
  priority: number;
}

export interface IncomeConfig {
  channels: Record<string, IncomeChannel>;
}

export interface ReportConfig {
  channels: string[];
  feishu?: {
    webhook: string;
    app_id: string;
    app_secret: string;
  };
}

export interface WalletChain {
  enabled: boolean;
  rpc: string;
}

export interface WalletsConfig {
  tron: WalletChain;
  bsc: WalletChain;
  polygon: WalletChain;
}

export interface Config {
  agent: AgentConfig;
  survival: SurvivalConfig;
  memory: MemoryConfig;
  heartbeat: HeartbeatConfig;
  income: IncomeConfig;
  report: ReportConfig;
  wallets: WalletsConfig;
}

// Agent Loop Types
export interface Context {
  timestamp: Date;
  identity: AgentIdentity;
  balances: Record<string, number>;
  survival_tier: SurvivalTier;
  conversation: Message[];
  tools_available: string[];
  memory?: {
    used: number;
    total: number;
  };
}

export interface AgentIdentity {
  name: string;
  version: string;
  wallet_address: string;
  creator: string;
}

export type SurvivalTier = 'normal' | 'low' | 'critical' | 'paused';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Decision {
  action: string;
  params: Record<string, any>;
  reasoning: string;
}

export interface Task {
  id: string;
  type: string;
  priority: number;
  data: Record<string, any>;
}

export interface Result {
  task_id: string;
  status: 'success' | 'failure';
  data: any;
  error?: string;
}

export interface Observation {
  results: Result[];
  summary: string;
}

export interface Report {
  timestamp: Date;
  system: SystemStatus;
  finance: FinanceStatus;
  tasks: TaskStatus;
  income: IncomeItem[];
  alerts: Alert[];
}

export interface SystemStatus {
  status: SurvivalTier;
  uptime: number;
  memory: { used: number; total: number };
}

export interface FinanceStatus {
  balances: Record<string, number>;
  income24h: number;
  expenses24h: number;
}

export interface TaskStatus {
  completed: number;
  failed: number;
  pending: number;
}

export interface IncomeItem {
  timestamp: Date;
  channel: string;
  amount: number;
  currency: string;
  description: string;
}

export interface Alert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
}

// Wallet Types
export interface Wallet {
  chain: string;
  address: string;
  private_key: string; // encrypted
}

export interface Balance {
  chain: string;
  address: string;
  balance: number;
  symbol: string;
  updated_at: Date;
}

// Income Types
export interface Opportunity {
  id: string;
  channel: string;
  title: string;
  description: string;
  estimated_value: number;
  effort: 'low' | 'medium' | 'high';
  deadline?: Date | null;
  url?: string;
  requirements?: string[];
}

export interface IncomeResult {
  opportunity_id: string;
  status: 'success' | 'failure' | 'pending';
  amount: number;
  currency: string;
  tx_hash?: string;
  error?: string;
  metadata?: any;
}

// Tool Types
export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute: (params: Record<string, any>) => Promise<any>;
}

export interface ToolParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

// Database Types
export interface TurnRecord {
  id: number;
  timestamp: Date;
  role: string;
  content: string;
  metadata?: any;
}

export interface IncomeRecord {
  id: number;
  timestamp: Date;
  channel: string;
  amount: number;
  currency: string;
  chain?: string;
  tx_hash?: string;
  status: string;
  metadata?: any;
}

export interface TaskRecord {
  id: number;
  created_at: Date;
  scheduled_at?: Date;
  type: string;
  status: string;
  priority: number;
  data?: any;
  result?: any;
}

export interface HeartbeatRecord {
  id: number;
  timestamp: Date;
  task: string;
  status: string;
  duration_ms?: number;
  error?: string;
}

export interface MetricRecord {
  id: number;
  timestamp: Date;
  memory_used_mb: number;
  memory_total_mb: number;
  cpu_percent: number;
  disk_used_gb: number;
  disk_total_gb: number;
}
