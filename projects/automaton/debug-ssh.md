# SSH连接调试

## 问题
密钥认证被拒绝，但连接可以建立。

## 可能原因

1. **authorized_keys文件权限不对**
   - 需要是 600 (rw-------)
   - .ssh目录需要是 700 (drwx------)

2. **SELinux或AppArmor限制**
   - 某些系统有额外的安全模块

3. **SSH服务端配置**
   - PubkeyAuthentication 可能被禁用
   - AuthorizedKeysFile 路径可能不同

4. **家目录权限**
   - 用户家目录不能被其他人写入

## 请在VPS上检查

```bash
# 1. 检查权限
ls -la ~
ls -la ~/.ssh/
ls -la ~/.ssh/authorized_keys

# 应该显示：
# drwxr-xr-x  OpenClaw OpenClaw  /home/OpenClaw
# drwx------  OpenClaw OpenClaw  .ssh
# -rw-------  OpenClaw OpenClaw  authorized_keys

# 2. 检查SSH配置
grep -E "^(PubkeyAuthentication|AuthorizedKeysFile|PasswordAuthentication)" /etc/ssh/sshd_config

# 3. 检查日志（如果有权限）
sudo tail -20 /var/log/auth.log
# 或
sudo journalctl -u sshd -n 20

# 4. 修复权限（如果需要）
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 755 ~

# 5. 确保公钥正确添加
cat ~/.ssh/authorized_keys
# 应该包含: ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOedfvWBQ9Y4BgHjMxSmNW5qid4fUc4ZU/tqoBjoTALS jarvis-automaton
```

## 临时方案

如果密钥一时调不通，我们可以先用密码方式部署，后续再切换到密钥。
