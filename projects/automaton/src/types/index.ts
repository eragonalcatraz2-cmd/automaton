// Automaton 核心类型定义

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

export type SurvivalTier = 'normal' | 'low_compute' | 'critical' | 'dead';

export interface Task {
  id: string;
  type: TaskType;
  status: TaskStatus;
  description: string;
  reward: number;
  cost: number;
  deadline: Date;
  createdAt: Date;
  completedAt?: Date;
  result?: string;
}

export type TaskType = 'content' | 'code' | 'data' | 'social' | 'research';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Skill {
  name: string;
  description: string;
  execute: (params: any) => Promise<SkillResult>;
  cost: number;  // 执行成本
}

export interface SkillResult {
  success: boolean;
  output: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  timestamp: Date;
  taskId?: string;
}

export interface HeartbeatStatus {
  timestamp: Date;
  balance: number;
  tier: SurvivalTier;
  activeTasks: number;
  pendingTasks: number;
  health: 'healthy' | 'degraded' | 'critical';
}

export interface Action {
  type: string;
  payload: any;
  expectedOutcome: string;
}

export interface Observation {
  actionId: string;
  result: any;
  timestamp: Date;
}
