import { AgentState, Task, Transaction } from '../types';
export declare class AutomatonDB {
    private db;
    private dbPath;
    constructor(dbPath?: string);
    initialize(): Promise<void>;
    private createTables;
    getAgentState(agentId: string): Promise<AgentState | undefined>;
    saveAgentState(state: AgentState): Promise<void>;
    createTask(task: Task): Promise<void>;
    getPendingTasks(): Promise<Task[]>;
    updateTaskStatus(taskId: string, status: string, result?: string): Promise<void>;
    addTransaction(tx: Transaction): Promise<void>;
    getTransactions(limit?: number): Promise<Transaction[]>;
    log(level: string, message: string, metadata?: any): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=Database.d.ts.map