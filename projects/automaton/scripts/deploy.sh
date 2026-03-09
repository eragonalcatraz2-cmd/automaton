#!/bin/bash
# Automaton 部署脚本
# 在VPS上运行此脚本完成部署

set -e

echo "🚀 开始部署 Automaton..."

# 检查系统
if ! command -v node &> /dev/null; then
    echo "📦 安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v git &> /dev/null; then
    echo "📦 安装 Git..."
    sudo apt-get update && sudo apt-get install -y git
fi

# 创建应用目录
APP_DIR="$HOME/automaton"
mkdir -p $APP_DIR
cd $APP_DIR

echo "📁 工作目录: $APP_DIR"

# 初始化项目
echo "📝 初始化项目..."
cat > package.json << 'EOF'
{
  "name": "automaton",
  "version": "0.1.0",
  "description": "Autonomous AI agent that earns its own existence",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "heartbeat": "node dist/heartbeat.js",
    "pm2:start": "pm2 start ecosystem.config.js",
    "pm2:stop": "pm2 stop automaton",
    "pm2:logs": "pm2 logs automaton"
  },
  "keywords": ["ai", "agent", "autonomous", "web4"],
  "author": "Jarvis",
  "license": "MIT",
  "dependencies": {
    "ethers": "^6.9.0",
    "sqlite3": "^5.1.6",
    "node-cron": "^3.0.3",
    "dotenv": "^16.3.1",
    "axios": "^1.6.2",
    "express": "^4.18.2",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/node-cron": "^3.0.11",
    "@types/express": "^4.17.21",
    "typescript": "^5.3.0",
    "ts-node": "^10.9.0",
    "pm2": "^5.3.0"
  }
}
EOF

# 安装依赖
echo "📦 安装依赖..."
npm install

# 创建目录结构
echo "📂 创建目录结构..."
mkdir -p src/{core,skills,db,services,api}
mkdir -p config logs data

# TypeScript配置
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# 环境变量模板
cat > .env.example << 'EOF'
# Automaton 配置
AGENT_NAME=jarvis-automaton
AGENT_ID=auto-generated

# API Keys (需要填写)
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here

# 区块链配置 (测试网)
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
WALLET_PRIVATE_KEY=your-private-key-here

# 服务器配置
PORT=3000
NODE_ENV=production

# 生存参数
INITIAL_BALANCE=100
CRITICAL_THRESHOLD=10
LOW_COMPUTE_THRESHOLD=50
EOF

cp .env.example .env

# PM2配置
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'automaton',
    script: './dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

echo "✅ 基础环境搭建完成！"
echo ""
echo "📋 下一步:"
echo "1. 编辑 .env 文件，填入API密钥"
echo "2. 运行: npm run build"
echo "3. 运行: npm run pm2:start"
echo ""
echo "🔧 常用命令:"
echo "  查看日志: npm run pm2:logs"
echo "  停止服务: npm run pm2:stop"
echo "  重启服务: pm2 restart automaton"
