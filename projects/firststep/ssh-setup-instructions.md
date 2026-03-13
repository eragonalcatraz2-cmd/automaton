# SSH密钥配置步骤

## 公钥内容

请复制以下公钥到您的VPS：

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOedfvWBQ9Y4BgHjMxSmNW5qid4fUc4ZU/tqoBjoTALS jarvis-automaton
```

## 在VPS上执行

```bash
# 1. SSH登录到VPS
ssh OpenClaw@43.167.195.89 -p 22
# 密码: Xhj.20260226

# 2. 创建.ssh目录（如果不存在）
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 3. 添加公钥到authorized_keys
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOedfvWBQ9Y4BgHjMxSmNW5qid4fUc4ZU/tqoBjoTALS jarvis-automaton" >> ~/.ssh/authorized_keys

# 4. 设置权限
chmod 600 ~/.ssh/authorized_keys

# 5. 验证SSH服务配置
cat /etc/ssh/sshd_config | grep -E "^(PubkeyAuthentication|PasswordAuthentication|AuthorizedKeysFile)"

# 确保有以下配置：
# PubkeyAuthentication yes
# AuthorizedKeysFile .ssh/authorized_keys

# 6. 重启SSH服务（如果需要）
sudo systemctl restart sshd
# 或
sudo service ssh restart
```

## 测试连接

配置完成后，我可以测试免密码登录：

```bash
ssh -i ~/.ssh/automaton_ed25519 OpenClaw@43.167.195.89 -p 22
```

如果成功，将不再提示输入密码。

## 安全建议

配置完成后，您可以：
1. **禁用密码登录**（可选，更安全）
2. **修改SSH端口**（可选）
3. **配置防火墙**，只允许特定IP访问

## 备用方案

如果密钥配置有问题，可以先用密码方式部署，后续再切换到密钥。
