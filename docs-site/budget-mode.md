# Budget Mode

> 穷鬼模式 — 减少 token 消耗的预算友好模式

## 1. Overview

Budget Mode (穷鬼模式) 通过跳过非必要功能显著减少 token 消耗。

## 2. Enabling

```bash
# 通过命令切换
/claude-code> /poor
```

或设置 `settings.json`:
```json
{
  "budgetMode": true
}
```

## 3. What Gets Skipped

| Feature | Normal | Budget Mode |
|---------|--------|-------------|
| `extract_memories` | ✅ 执行 | ❌ 跳过 |
| `prompt_suggestion` | ✅ 执行 | ❌ 跳过 |
| `verification_agent` | ✅ 执行 | ❌ 跳过 |

## 4. Implementation

`src/commands/poor/poorMode.ts`:

```typescript
export function isBudgetModeEnabled(): boolean {
  const settings = loadSettings();
  return settings.budgetMode === true;
}

export function shouldSkipFeature(feature: string): boolean {
  if (!isBudgetModeEnabled()) {
    return false;
  }

  const budgetModeSkipped = [
    'extract_memories',
    'prompt_suggestion',
    'verification_agent',
  ];

  return budgetModeSkipped.includes(feature);
}
```

## 5. Token Savings

| Mode | Est. Token/Query | Cost |
|------|------------------|------|
| Normal | ~3000 | $0.015 |
| Budget | ~1500 | $0.0075 |

**节省约 50% token 消耗**

## 6. Use Cases

- 学习和实验
- 简单任务
- 资源受限环境
- 调试模式
