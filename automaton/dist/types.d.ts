/**
 * Automaton Core Types
 * 核心类型定义
 */
export type SurvivalTier = 'normal' | 'low_compute' | 'critical' | 'dead';
export type TaskType = 'content' | 'code' | 'data' | 'social' | 'research' | 'income' | 'airdrop' | 'opensource' | 'freelance' | 'affiliate';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export interface AgentState {
    id: string;
    name: string;
    balance: number;
    survivalTier: SurvivalTier;
    lastHeartbeat: Date;
    totalEarnings: number;
    totalSpent: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Task {
    id: string;
    type: TaskType;
    title?: string;
    status: TaskStatus;
    description: string;
    reward: number;
    cost: number;
    deadline: Date;
    createdAt: Date;
    completedAt?: Date;
    result?: string;
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
//# sourceMappingURL=types.d.ts.map