// FirstStep v3.0 - Execute Gasless Tasks
// 执行无 gas 任务获取收益

import { getConfig } from '../src/config';
import { DatabaseManager } from '../src/db/database';
import { IncomeManager } from '../src/income/manager';
import { getGaslessAirdrops } from '../src/income/gasless-airdrops';

async function executeGaslessTasks() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     FirstStep - 执行无 Gas 任务获取收益        ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  const config = getConfig();
  const db = new DatabaseManager();
  const incomeManager = new IncomeManager(config, db);
  
  // 1. 获取无 gas 空投
  console.log('📋 步骤 1: 获取无 Gas 空投列表...\n');
  const gaslessAirdrops = getGaslessAirdrops();
  console.log(`✅ 发现 ${gaslessAirdrops.length} 个无 Gas 空投\n`);
  
  // 2. 显示任务详情
  console.log('📋 步骤 2: 任务详情\n');
  for (let i = 0; i < gaslessAirdrops.length; i++) {
    const airdrop = gaslessAirdrops[i];
    console.log(`${i + 1}. ${airdrop.title}`);
    console.log(`   描述: ${airdrop.description}`);
    console.log(`   平台: ${airdrop.url}`);
    console.log(`   工作量: ${airdrop.effort}`);
    if (airdrop.requirements) {
      console.log(`   要求: ${airdrop.requirements.join(', ')}`);
    }
    console.log('');
  }
  
  // 3. 执行前 3 个任务
  console.log('🚀 步骤 3: 执行任务（前 3 个）\n');
  const tasksToExecute = gaslessAirdrops.slice(0, 3);
  
  for (const airdrop of tasksToExecute) {
    console.log(`⏳ 正在执行: ${airdrop.title}...`);
    
    // 记录任务到数据库
    db.insertTask({
      type: 'income',
      status: 'pending',
      priority: 1,
      data: airdrop
    });
    
    // 尝试执行
    const result = await incomeManager.executeOpportunity(airdrop);
    
    console.log(`   状态: ${result.status}`);
    if (result.error) {
      console.log(`   说明: ${result.error}`);
    }
    console.log('');
  }
  
  // 4. 总结
  console.log('📊 步骤 4: 执行总结\n');
  const pendingTasks = db.getPendingTasks(10);
  console.log(`✅ 已创建 ${pendingTasks.length} 个待处理任务`);
  console.log(`💡 下一步: 使用浏览器自动化完成实际交互`);
  console.log(`💰 预期收益: 完成任务后获得空投代币/NFT/XP\n`);
  
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  任务执行完成！等待浏览器自动化进一步处理...   ║');
  console.log('╚════════════════════════════════════════════════╝');
  
  db.close();
}

executeGaslessTasks().catch(error => {
  console.error('执行失败:', error);
  process.exit(1);
});