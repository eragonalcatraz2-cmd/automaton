/**
 * 穷了么 - 核心计算逻辑
 */

// 财务健康检测器
class QiongLeMe {
  constructor(data) {
    this.income = parseFloat(data.income) || 0;
    this.fixedExpense = parseFloat(data.fixedExpense) || 0;
    this.variableExpense = parseFloat(data.variableExpense) || 0;
    this.savings = parseFloat(data.savings) || 0;
    this.debt = parseFloat(data.debt) || 0;
    
    this.totalExpense = this.fixedExpense + this.variableExpense;
  }

  // 计算生存天数
  getSurvivalDays() {
    if (this.totalExpense <= 0) return 999;
    const dailyExpense = this.totalExpense / 30;
    return Math.floor(this.savings / dailyExpense);
  }

  // 计算收支比
  getExpenseRatio() {
    if (this.income <= 0) return 100;
    return Math.min(100, Math.round((this.totalExpense / this.income) * 100));
  }

  // 计算债务率
  getDebtRatio() {
    if (this.income <= 0) return 0;
    return Math.round((this.debt / this.income) * 100);
  }

  // 综合评分 0-100
  getScore() {
    let score = 50;
    
    // 储蓄充足度 (+20分)
    const survivalDays = this.getSurvivalDays();
    if (survivalDays >= 180) score += 20;
    else if (survivalDays >= 90) score += 15;
    else if (survivalDays >= 30) score += 10;
    else if (survivalDays >= 7) score += 5;
    
    // 收支健康度 (+15分)
    const expenseRatio = this.getExpenseRatio();
    if (expenseRatio <= 50) score += 15;
    else if (expenseRatio <= 70) score += 10;
    else if (expenseRatio <= 85) score += 5;
    else score -= 10;
    
    // 债务安全度 (+15分)
    const debtRatio = this.getDebtRatio();
    if (debtRatio === 0) score += 15;
    else if (debtRatio <= 20) score += 10;
    else if (debtRatio <= 40) score += 5;
    else score -= 15;
    
    return Math.max(0, Math.min(100, score));
  }

  // 获取等级
  getLevel() {
    const score = this.getScore();
    if (score >= 80) return { level: '财务自由', emoji: '🟢', color: 'green' };
    if (score >= 60) return { level: '亚健康', emoji: '🟡', color: 'yellow' };
    if (score >= 40) return { level: '重症监护', emoji: '🟠', color: 'orange' };
    if (score >= 20) return { level: '临床死亡', emoji: '🔴', color: 'red' };
    return { level: '彻底凉凉', emoji: '⚫', color: 'black' };
  }

  // 毒舌文案生成
  getRoast() {
    const roasts = [];
    
    // 根据收支比吐槽
    const expenseRatio = this.getExpenseRatio();
    if (expenseRatio > 90) {
      roasts.push("你的工资到账后，只在你账户里旅游了3秒钟");
    } else if (expenseRatio > 80) {
      roasts.push("月光不是你的选择，是你的宿命");
    }
    
    // 根据储蓄吐槽
    const survivalDays = this.getSurvivalDays();
    if (survivalDays < 7) {
      roasts.push("你的储蓄撑不过一周，建议现在开始辟谷");
    } else if (survivalDays < 30) {
      roasts.push("如果明天失业，你将在一个月内露宿街头");
    }
    
    // 根据债务吐槽
    const debtRatio = this.getDebtRatio();
    if (debtRatio > 50) {
      roasts.push("你工作的主要目的是给银行打工");
    }
    
    // 默认吐槽
    if (roasts.length === 0) {
      roasts.push("虽然还活着，但也没什么生活质量可言");
    }
    
    return roasts[Math.floor(Math.random() * roasts.length)];
  }

  // 抢救方案
  getRescuePlan() {
    const plans = [];
    const expenseRatio = this.getExpenseRatio();
    const survivalDays = this.getSurvivalDays();
    
    if (expenseRatio > 80) {
      const saveAmount = Math.round(this.totalExpense * 0.2);
      plans.push(`🩸 立即止血：削减20%支出（约¥${saveAmount}/月），从取消不必要的订阅开始`);
    }
    
    if (survivalDays < 30) {
      plans.push(`💰 紧急储蓄：每月强制存下收入的10%，先建立3个月生活费的安全垫`);
    }
    
    if (this.debt > 0) {
      plans.push(`📉 债务优化：优先还高息债务，避免以贷养贷的死亡螺旋`);
    }
    
    if (this.variableExpense > this.fixedExpense) {
      plans.push(`🍱 节流重点：变动支出过高，少点外卖、少喝奶茶就能续命`);
    }
    
    plans.push(`🧘 心理建设：财务健康是马拉松，不是百米冲刺，从今天开始改变`);
    
    return plans;
  }

  // 生成完整报告
  generateReport(userName = '匿名用户') {
    const score = this.getScore();
    const level = this.getLevel();
    const survivalDays = this.getSurvivalDays();
    const expenseRatio = this.getExpenseRatio();
    const debtRatio = this.getDebtRatio();
    
    const report = `
═══════════════════════════
    💀 穷了么 · 诊断报告
═══════════════════════════

患者：${userName}
诊断日期：${new Date().toLocaleDateString('zh-CN')}

【生命体征】
📊 财务健康分：${score}/100
⏰ 生存天数：${survivalDays}天
📈 收支比例：${expenseRatio}%
💳 债务负担：${debtRatio}%

【诊断结果】
${level.emoji} 等级：${level.level}

【毒舌点评】
💬 "${this.getRoast()}"

【抢救方案】
${this.getRescuePlan().map((p, i) => `${i + 1}. ${p}`).join('\n')}

预计续命：${Math.max(30, survivalDays + 30)}天

═══════════════════════════
*本诊断仅供参考，如有雷同，说明你也该省钱了*
═══════════════════════════
`;
    
    return report;
  }
}

module.exports = QiongLeMe;
