// FirstStep v3.0 - Gasless Airdrops (No Gas Required)
// 无需 gas 费即可参与的空投

import type { Opportunity } from '../types';

// 无 gas 空投列表
export function getGaslessAirdrops(): Opportunity[] {
  const now = new Date();
  
  return [
    {
      id: 'ens-claim-2026',
      channel: 'airdrop',
      title: 'ENS 域名持有者空投',
      description: '持有 ENS 域名的用户可能有资格领取空投，只需签名无需 gas',
      estimated_value: 0,
      effort: 'low',
      deadline: null,
      url: 'https://claim.ens.domains',
      requirements: [
        '持有 ENS 域名',
        '连接钱包签名',
        '无需 gas 费'
      ]
    },
    {
      id: 'snapshot-voting-2026',
      channel: 'airdrop',
      title: 'Snapshot 治理投票',
      description: '参与 DAO 治理投票，很多项目会给投票者空投',
      estimated_value: 0,
      effort: 'low',
      deadline: null,
      url: 'https://snapshot.org',
      requirements: [
        '持有治理代币',
        '在 Snapshot 投票',
        '签名即可，无 gas'
      ]
    },
    {
      id: 'guild-roles-2026',
      channel: 'airdrop',
      title: 'Guild.xyz 角色收集',
      description: '通过完成任务获得 Discord 角色，很多项目据此空投',
      estimated_value: 0,
      effort: 'medium',
      deadline: null,
      url: 'https://guild.xyz',
      requirements: [
        '连接钱包和 Discord',
        '完成社交任务',
        '获得角色等待空投'
      ]
    },
    {
      id: 'galxe-campaigns-2026',
      channel: 'airdrop',
      title: 'Galxe 任务活动',
      description: '完成 Galxe 上的社交任务，领取 OAT 和积分',
      estimated_value: 0,
      effort: 'medium',
      deadline: null,
      url: 'https://galxe.com',
      requirements: [
        '连接钱包',
        '关注 Twitter',
        '加入 Discord',
        '完全免费'
      ]
    },
    {
      id: 'zealy-quests-2026',
      channel: 'airdrop',
      title: 'Zealy 任务平台',
      description: '完成 Zealy 上的任务获得 XP，项目方常据此空投',
      estimated_value: 0,
      effort: 'medium',
      deadline: null,
      url: 'https://zealy.io',
      requirements: [
        '注册账号',
        '完成社交任务',
        '积累 XP 等待空投'
      ]
    },
    {
      id: 'crew3-tasks-2026',
      channel: 'airdrop',
      title: 'Crew3 (Sograph) 任务',
      description: '完成 Crew3 任务获得角色和奖励',
      estimated_value: 0,
      effort: 'medium',
      deadline: null,
      url: 'https://crew3.xyz',
      requirements: [
        '连接钱包和 Discord',
        '完成社区任务',
        '获得早期贡献者角色'
      ]
    },
    {
      id: 'layer3-bounties-2026',
      channel: 'airdrop',
      title: 'Layer3 赏金任务',
      description: '完成 Layer3 上的学习教程和任务，获得 NFT 奖励',
      estimated_value: 0,
      effort: 'low',
      deadline: null,
      url: 'https://layer3.xyz',
      requirements: [
        '连接钱包',
        '完成教程任务',
        '领取 NFT 奖励'
      ]
    },
    {
      id: 'rabbit-hole-tasks-2026',
      channel: 'airdrop',
      title: 'RabbitHole 任务',
      description: '完成 Web3 任务学习，获得经验和奖励',
      estimated_value: 0,
      effort: 'medium',
      deadline: null,
      url: 'https://rabbithole.gg',
      requirements: [
        '连接钱包',
        '完成链上任务（需 gas）或社交任务（免费）',
        '获得代币奖励'
      ]
    }
  ];
}

// 分类：完全免费 vs 可能需要少量 gas
export function categorizeAirdrops(): {
  completelyFree: Opportunity[];
  mightNeedGas: Opportunity[];
} {
  const all = getGaslessAirdrops();
  
  return {
    completelyFree: all.filter(a => 
      a.id.includes('guild') || 
      a.id.includes('galxe') || 
      a.id.includes('zealy') ||
      a.id.includes('crew3') ||
      a.id.includes('snapshot')
    ),
    mightNeedGas: all.filter(a => 
      a.id.includes('rabbit') ||
      a.id.includes('layer3')
    )
  };
}