/**
 * Automaton Core Types
 * 核心类型定义
 */

// 生存等级
export type SurvivalTier = 'normal' | 'low_compute' | 'critical' | 'dead';

// 任务类型
export type TaskType = 'content' | 'code' | 'data' | 'social' | 'research' | 'income' | 'airdrop' | 'opensource' | 'freelance' | 'affiliate';

// 任务状态
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// Agent状态
export interface AgentState {
  id: string;
  name: string;
  balance: number;        // 余额（美元）
  survivalTier: SurvivalTier;
  lastHeartbeat: Date;
  totalEarnings: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

// 任务定义
export interface Task {
  id: string;
  type: TaskType;
  title?: string;
  status: TaskStatus;
  description: string;
  reward: number;         // 完成奖励
  cost: number;           // 执行成本
  deadline: Date;
  createdAt: Date;
  completedAt?: Date;
  result?: string;
}

// 技能执行结果
export interface SkillResult {
  success: boolean;
  output: string;
  error?: string;
  metadata?: Record<string, any>;
}

// 交易记录
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  timestamp: Date;
  taskId?: string;
}

// 心跳状态
export interface HeartbeatStatus {
  timestamp: Date;
  balance: number;
  tier: SurvivalTier;
  activeTasks: number;
  pendingTasks: number;
  health: 'healthy' | 'degraded' | 'critical';
}

// 行动定义
export interface Action {
  type: string;
  payload: any;
  expectedOutcome: string;
}

// 观察结果
export interface Observation {
  actionId: string;
  result: any;
  timestamp: Date;
}
