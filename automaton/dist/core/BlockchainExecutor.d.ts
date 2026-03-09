/**
 * BlockchainExecutor - 真正的区块链交互执行器
 * 使用 ethers.js 进行真实的链上交易
 */
import { SkillResult } from '../types';
export interface ChainConfig {
    name: string;
    rpcUrl: string;
    chainId: number;
    nativeToken: string;
    faucetUrl?: string;
    explorerUrl: string;
}
export interface WalletConfig {
    privateKey: string;
    address: string;
}
export declare class BlockchainExecutor {
    private providers;
    private wallets;
    private chainConfigs;
    constructor();
    private initializeChains;
    /**
     * 初始化钱包
     * 从环境变量或配置文件加载私钥
     */
    initializeWallet(chain: string, privateKey: string): Promise<string>;
    /**
     * 检查余额
     */
    getBalance(chain: string): Promise<bigint>;
    /**
     * 自动获取测试币（从水龙头）
     */
    requestFaucet(chain: string): Promise<boolean>;
    /**
     * 执行桥接操作
     */
    executeBridge(fromChain: string, toChain: string, amount: string): Promise<SkillResult>;
    /**
     * 执行代币交换
     */
    executeSwap(chain: string, fromToken: string, toToken: string, amount: string): Promise<SkillResult>;
    /**
     * 铸造 NFT
     */
    mintNFT(chain: string, contractAddress: string, tokenURI?: string): Promise<SkillResult>;
    /**
     * 部署合约
     */
    deployContract(chain: string, bytecode: string, abi: any[], args?: any[]): Promise<SkillResult>;
    /**
     * 获取交易状态
     */
    getTransactionStatus(chain: string, txHash: string): Promise<string>;
}
//# sourceMappingURL=BlockchainExecutor.d.ts.map