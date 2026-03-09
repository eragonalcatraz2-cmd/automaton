import { AgentState } from '../types';
export declare class ReActAgent {
    private db;
    private survival;
    private heartbeat;
    private airdropHunter;
    private openSourceSponsor;
    private state;
    private isRunning;
    private readonly agentId;
    private heartbeatCount;
    constructor();
    initialize(): Promise<void>;
    private onHeartbeat;
    /**
     * Scan for airdrop opportunities (zero capital strategy)
     */
    private scanAirdropOpportunities;
    /**
     * Discover open source opportunities (zero capital strategy)
     */
    private discoverOpenSourceOpportunities;
    /**
     * Print comprehensive zero-capital report
     */
    private printZeroCapitalReport;
    private generateIncomeOpportunity;
    private generateEmergencyTask;
    private executeTask;
    private simulateTaskExecution;
    start(): Promise<void>;
    stop(): Promise<void>;
    getStatus(): {
        running: boolean;
        state: AgentState | null;
    };
}
//# sourceMappingURL=Agent.d.ts.map