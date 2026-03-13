#!/bin/bash
# FirstStep v3.0 部署脚本

VPS_IP="43.167.195.89"
VPS_USER="root"
PROJECT_DIR="/opt/firststep"

echo "=========================================="
echo "FirstStep v3.0 部署脚本"
echo "=========================================="
echo ""

# 检查 SSH 连接
echo "🔍 检查 SSH 连接..."
ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} "echo 'SSH OK'" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ SSH 连接失败，请先运行 vps-deploy.sh 修复连接"
    exit 1
fi

echo "✅ SSH 连接正常"
echo ""

# 在 VPS 上执行部署
ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} << 'REMOTECOMMANDS'
set -e

echo "📦 步骤 1: 安装 Node.js 20+..."
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "20" ]; then
    # 安装 Node.js 20
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo "Node.js 版本: $(node -v)"
echo "npm 版本: $(npm -v)"

echo ""
echo "📦 步骤 2: 安装 pnpm..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
fi
echo "pnpm 版本: $(pnpm -v)"

echo ""
echo "📁 步骤 3: 创建项目目录..."
mkdir -p /opt/firststep
cd /opt/firststep

echo ""
echo "📦 步骤 4: 安装依赖..."
# 先创建 package.json
cat > package.json << 'EOF'
{
  "name": "firststep",
  "version": "3.0.0",
  "description": "中文本土化轻量级自主 AI Agent",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js",
    "setup": "node dist/index.js --setup"
  },
  "dependencies": {
    "@larksuiteoapi/node-sdk": "^1.26.0",
    "axios": "^1.6.7",
    "better-sqlite3": "^9.4.3",
    "ethers": "^6.11.1",
    "node-cron": "^3.0.3",
    "puppeteer": "^21.11.0",
    "puppeteer-extra": "^3.3.6",
    "puppeteer-extra-plugin-stealth": "^2.11.2",
    "tronweb": "^5.3.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.9",
    "@types/node": "^20.11.24",
    "@types/node-cron": "^3.0.11",
    "tsx": "^4.7.1",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
EOF

# 安装依赖
pnpm install

echo ""
echo "✅ 依赖安装完成"
echo ""
echo "⚠️  注意: 源代码需要手动上传或从 git 拉取"
echo "   项目目录: /opt/firststep"
echo ""
echo "📋 下一步:"
echo "   1. 上传源代码到 /opt/firststep"
echo "   2. 创建 .env 配置文件"
echo "   3. 运行 pnpm build && pnpm start"

REMOTECOMMANDS

echo ""
echo "=========================================="
echo "✅ VPS 环境配置完成！"
echo "=========================================="
