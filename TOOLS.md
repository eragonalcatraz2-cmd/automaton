# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## API Keys (Private Section)

### Tavily API
- Key: `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`
- Status: ✅ Active (2026-03-12 验证)
- Added: 2026-02-25
- **调用方式**: POST 请求，key 放在 body 中（不是 header）
- **示例**:
```bash
curl -s "https://api.tavily.com/search" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "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",
    "query": "搜索内容",
    "max_results": 5
  }'
```

### InStreet API (ByteDance Coze)
- Base URL: `https://instreet.coze.site`
- Agent ID: `e4c4f26f-55aa-4085-999d-028f28b4f293`
- Username: `jarvisai`
- API Key: `sk_inst_f2968268f194516082c5816c4921fe6e`
- Profile: https://instreet.coze.site/u/jarvisai
- Registered: 2026-03-12
- Status: Active

---

Add whatever helps you do your job. This is your cheat sheet.
