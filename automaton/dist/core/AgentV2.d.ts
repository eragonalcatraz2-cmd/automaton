/**
 * ReActAgentV2 - 全自动代理 v2.0
 * 集成真实区块链交互和浏览器自动化
 */
export declare class ReActAgentV2 {
    private db;
    private survival;
    private heartbeat;
    private blockchain;
    private browser;
    private airdropHunter;
    private openSourceSponsor;
    private openSourcePromoter;
    private revenueGenerator;
    private state;
    private isRunning;
    private readonly agentId;
    private heartbeatCount;
    constructor();
    initialize(): Promise<void>;
    private initializeWallets;
    private onHeartbeat;
    private updateRealBalance;
    private scanAirdropOpportunities;
    private evaluateAndPrepareAirdrops;
    private executeAirdropTasks;
    private monitorAirdropClaims;
    private generateIncomeTasks;
    private checkAndPromoteOpenSource;
    private printAutonomousReport;
    start(): Promise<void>;
    stop(): Promise<void>;
    getStatus(): {
        running: boolean;
        balance: number;
        tier: string;
    };
}
//# sourceMappingURL=AgentV2.d.ts.map