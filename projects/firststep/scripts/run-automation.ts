// FirstStep v3.0 - Run Gasless Task Automation
// 执行浏览器自动化任务

import { getConfig } from '../src/config';
import { DatabaseManager } from '../src/db/database';
import { GaslessTaskExecutor } from '../src/automation/gasless-executor';

async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   FirstStep - 浏览器自动化执行无 Gas 任务     ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  const db = new DatabaseManager();
  const executor = new GaslessTaskExecutor();
  
  // 1. 初始化浏览器
  console.log('🚀 步骤 1: 初始化浏览器...');
  const initialized = await executor.initialize();
  if (!initialized) {
    console.error('❌ 浏览器初始化失败');
    process.exit(1);
  }
  console.log('✅ 浏览器已启动\n');
  
  // 2. 获取待执行任务
  console.log('📋 步骤 2: 获取待执行任务...');
  const tasks = db.prepare("SELECT * FROM tasks WHERE type = 'income' AND status = 'pending'").all();
  console.log(`✅ 发现 ${tasks.length} 个待处理任务\n`);
  
  // 3. 解析任务数据
  console.log('📋 步骤 3: 准备执行任务...');
  const opportunities = tasks.slice(0, 3).map(task => {
    try {
      return JSON.parse(task.data || '{}');
    } catch {
      return null;
    }
  }).filter(Boolean);
  
  console.log(`✅ 准备执行 ${opportunities.length} 个任务:\n`);
  opportunities.forEach((opp, i) => {
    console.log(`${i + 1}. ${opp.title}`);
    console.log(`   URL: ${opp.url}`);
  });
  console.log('');
  
  // 4. 执行自动化
  console.log('🤖 步骤 4: 开始浏览器自动化...\n');
  const results = await executor.executeBatch(opportunities);
  
  // 5. 显示结果
  console.log('\n📊 执行结果:');
  Object.entries(results).forEach(([id, success]) => {
    console.log(`  ${id}: ${success ? '✅ 成功' : '❌ 失败'}`);
  });
  
  // 6. 关闭浏览器
  console.log('\n🔄 步骤 5: 关闭浏览器...');
  await executor.close();
  console.log('✅ 浏览器已关闭\n');
  
  // 7. 总结
  const successCount = Object.values(results).filter(Boolean).length;
  console.log('╔════════════════════════════════════════════════╗');
  console.log(`║  执行完成: ${successCount}/${opportunities.length} 个任务成功          ║`);
  console.log('║  截图已保存到 /opt/firststep/logs/            ║');
  console.log('╚════════════════════════════════════════════════╝');
  
  db.close();
}

main().catch(error => {
  console.error('执行失败:', error);
  process.exit(1);
});