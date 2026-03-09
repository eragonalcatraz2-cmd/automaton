import { AutomatonDB } from '../db/Database';
import { SurvivalSystem } from './Survival';
export interface HeartbeatConfig {
    intervalMs: number;
    maxRetries: number;
    alertThresholds: {
        balanceLow: number;
        tasksStuck: number;
        noEarningsHours: number;
    };
}
export declare class HeartbeatMonitor {
    private db;
    private survival;
    private config;
    private agentId;
    private timer;
    private isRunning;
    private onBeatCallback?;
    constructor(db: AutomatonDB, survival: SurvivalSystem, agentId: string, config?: Partial<HeartbeatConfig>);
    start(onBeat?: () => Promise<void>): Promise<void>;
    stop(): void;
    private beat;
    private initializeAgent;
    private checkAlerts;
    private determineHealth;
    private handleDeadState;
    private handleCriticalState;
    private printStatus;
    getIsRunning(): boolean;
}
//# sourceMappingURL=Heartbeat.d.ts.map