#!/bin/bash
# VPS 部署脚本 - 修复 SSH 密钥并部署 FirstStep v3.0

VPS_IP="43.167.195.89"
VPS_USER="root"
NEW_PUBKEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDeQqqI5tQvVvEizRt8OnhOmH7UP57Q4Rc919D6D9gNtpVGRk61/eVYZcal38p5f8/neVwYtlvApPNP0kzqJnnmCxGS5HaDVWcM7wme0B8oZbG8QFia9n0nIGLbObyZ0ygA3jw5Pp1wv6X5mY+Ntmt7MRk785FKFkvuZwVphzzEy+Vn40jhglyPwEY0iPJ1KBxZ57GeZU0DlhnNyFNKSGoAwbJjZAxBZ4ReHc6CafkKWsn8rnqwOoqqRzawi7NjfEkHp1XLSxPg2C2uoiOO/0mBrKCBUnyQ3eWVGipyJHdF1ilpeMbNbLvAY8tWBC8bLhoX1C+tLaSqFDvT5hS8Pnqb skey-dgpmaaxr"

echo "=========================================="
echo "FirstStep v3.0 VPS 部署脚本"
echo "=========================================="
echo ""
echo "⚠️  注意: 此脚本需要 VPS 的 root 密码才能执行"
echo ""

# 检查是否有密码
if [ -z "$VPS_PASSWORD" ]; then
    echo "❌ 错误: 需要设置 VPS_PASSWORD 环境变量"
    echo "   示例: export VPS_PASSWORD='your_password'"
    exit 1
fi

echo "📋 部署步骤:"
echo "1. 使用密码登录 VPS"
echo "2. 配置 SSH 公钥认证"
echo "3. 安装 Node.js 20+"
echo "4. 部署 FirstStep v3.0"
echo ""

# 使用 sshpass 自动输入密码
if ! command -v sshpass &> /dev/null; then
    echo "📦 安装 sshpass..."
    sudo apt-get update && sudo apt-get install -y sshpass
fi

echo "🔑 步骤 1: 配置 SSH 公钥..."
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${VPS_USER}@${VPS_IP} << 'REMOTECOMMANDS'
# 创建 .ssh 目录
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 添加公钥
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDeQqqI5tQvVvEizRt8OnhOmH7UP57Q4Rc919D6D9gNtpVGRk61/eVYZcal38p5f8/neVwYtlvApPNP0kzqJnnmCxGS5HaDVWcM7wme0B8oZbG8QFia9n0nIGLbObyZ0ygA3jw5Pp1wv6X5mY+Ntmt7MRk785FKFkvuZwVphzzEy+Vn40jhglyPwEY0iPJ1KBxZ57GeZU0DlhnNyFNKSGoAwbJjZAxBZ4ReHc6CafkKWsn8rnqwOoqqRzawi7NjfEkHp1XLSxPg2C2uoiOO/0mBrKCBUnyQ3eWVGipyJHdF1ilpeMbNbLvAY8tWBC8bLhoX1C+tLaSqFDvT5hS8Pnqb skey-dgpmaaxr" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 确保家目录权限正确
chmod 755 ~

echo "✅ SSH 公钥已配置"

# 检查 SSH 配置
echo ""
echo "📋 当前 SSH 配置:"
grep -E "^(PubkeyAuthentication|PasswordAuthentication|PermitRootLogin)" /etc/ssh/sshd_config 2>/dev/null || echo "使用默认配置"

# 重启 SSH 服务
systemctl restart sshd || service ssh restart

echo "✅ SSH 服务已重启"
REMOTECOMMANDS

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSH 公钥配置成功！"
    echo ""
    echo "🧪 测试连接..."
    ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} "echo 'SSH 密钥认证成功!' && uptime"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SSH 连接恢复正常！"
        echo ""
        echo "📦 下一步: 部署 FirstStep v3.0"
        echo "   运行: ./deploy-firststep.sh"
    else
        echo ""
        echo "⚠️  密钥测试失败，可能需要检查 VPS 上的配置"
    fi
else
    echo ""
    echo "❌ 配置失败，请检查密码是否正确"
fi
