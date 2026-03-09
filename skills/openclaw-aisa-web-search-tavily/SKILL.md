---
name: openclaw-aisa-web-search-tavily
description: AI-optimized web search via Tavily API proxy, providing concise and relevant results with options for deep or news-focused queries.
---

# Web Search by Tavily

## Overview

This skill enables AI-optimized web search using the Tavily API. It provides concise, relevant search results specifically designed for AI agents, with support for both deep research and news-focused queries.

## When to Use

Use this skill when you need:
1. **Real-time information** - Current events, latest news, recent developments
2. **Fact verification** - Check claims or find authoritative sources
3. **Research assistance** - Gather information on specific topics
4. **News updates** - Get the latest headlines in AI, tech, or other fields
5. **Deep dives** - Comprehensive research on complex topics

## Usage

### Basic Search

```markdown
I'll search for the latest information on [topic].
```

The skill will automatically use Tavily to fetch relevant, up-to-date results.

### News-Focused Queries

For time-sensitive information like daily news:
```markdown
Search for today's news about [topic] using Tavily.
```

### Deep Research

For comprehensive research:
```markdown
Do a deep search on [topic] to find detailed information.
```

## Configuration

This skill requires a Tavily API key. Set it via environment variable:

```bash
export TAVILY_API_KEY="your-api-key-here"
```

Or configure it in your OpenClaw environment.

## Best Practices

1. **Be specific** - Clear, specific queries yield better results
2. **Use for current info** - Tavily excels at finding recent information
3. **Cross-reference** - For critical facts, verify with multiple sources
4. **Summarize** - Distill search results into actionable insights
5. **Attribute sources** - Always cite where information comes from

## Example Workflows

### Daily News Summary
```
User: "Get me today's AI news"
Agent: Uses Tavily search → Finds latest AI developments → Summarizes key points
```

### Fact Checking
```
User: "Is [claim] true?"
Agent: Searches Tavily → Finds authoritative sources → Presents evidence
```

### Research Task
```
User: "Tell me about [complex topic]"
Agent: Deep search → Gathers multiple sources → Synthesizes comprehensive answer
```

## Limitations

- Requires valid Tavily API key
- Results depend on Tavily's index coverage
- Rate limits may apply based on your Tavily plan

## Related Skills

- `self-improving-agent` - Capture learnings from search results
- `memory-manager` - Store important findings for future reference
