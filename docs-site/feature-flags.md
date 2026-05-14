# Feature Flags

> 19 个 Feature Flags 控制功能开关

## 1. Overview

Feature flags 控制哪些功能在运行时启用。代码中统一通过 `import { feature } from 'bun:bundle'` 导入。

## 2. Enabling Features

```bash
# 环境变量启用
FEATURE_<FLAG_NAME>=1 bun run dev
```

## 3. Feature List

### Basic Features

| Flag | Description |
|------|-------------|
| `BUDDY` | Buddy 模式 |
| `TRANSCRIPT_CLASSIFIER` | 转录分类器 |
| `BRIDGE_MODE` | Remote Control / Bridge 模式 |
| `AGENT_TRIGGERS_REMOTE` | Agent 触发远程 |
| `CHICAGO_MCP` | Chicago MCP 功能 |
| `VOICE_MODE` | 语音输入模式 |

### Stats/Cache Features

| Flag | Description |
|------|-------------|
| `SHOT_STATS` | 射击统计 |
| `PROMPT_CACHE_BREAK_DETECTION` | 提示缓存断裂检测 |
| `TOKEN_BUDGET` | Token 预算管理 |

### P0 Local Features

| Flag | Description |
|------|-------------|
| `AGENT_TRIGGERS` | Agent 触发器 |
| `ULTRATHINK` | 深度思考模式 |
| `BUILTIN_EXPLORE_PLAN_AGENTS` | 内置探索计划 Agent |
| `LODESTONE` | Lodestone 功能 |

### P1 API-dependent Features

| Flag | Description |
|------|-------------|
| `EXTRACT_MEMORIES` | 记忆提取 |
| `VERIFICATION_AGENT` | 验证 Agent |
| `KAIROS_BRIEF` | Kairos 简报 |
| `AWAY_SUMMARY` | 离开摘要 |
| `ULTRAPLAN` | 超级计划 |

### P2 Features

| Flag | Description |
|------|-------------|
| `DAEMON` | Daemon 模式 |

## 4. Usage Pattern

```typescript
import { feature } from 'bun:bundle';

// 检查 feature 是否启用
if (feature('BUDDY')) {
  // 启用 buddy 功能
  await initBuddy();
}

// Feature-gated 模块加载
if (feature('BRIDGE_MODE')) {
  await import('./bridge/bridgeMain.ts');
}

// 多个 feature
if (feature('AGENT_TRIGGERS') && feature('BUILTIN_EXPLORE_PLAN_AGENTS')) {
  enableExploreAgents();
}
```

## 5. Build vs Dev Mode

### Build Defaults (19 features)
```typescript
// build.ts
const defaultFeatures = [
  // Basic
  'BUDDY',
  'TRANSCRIPT_CLASSIFIER',
  'BRIDGE_MODE',
  'AGENT_TRIGGERS_REMOTE',
  'CHICAGO_MCP',
  'VOICE_MODE',
  // Stats/Cache
  'SHOT_STATS',
  'PROMPT_CACHE_BREAK_DETECTION',
  'TOKEN_BUDGET',
  // P0 Local
  'AGENT_TRIGGERS',
  'ULTRATHINK',
  'BUILTIN_EXPLORE_PLAN_AGENTS',
  'LODESTONE',
  // P1 API
  'EXTRACT_MEMORIES',
  'VERIFICATION_AGENT',
  'KAIROS_BRIEF',
  'AWAY_SUMMARY',
  'ULTRAPLAN',
  // P2
  'DAEMON',
];
```

### Dev Mode Defaults
Dev mode 默认全部启用（`scripts/dev.ts`）。

## 6. Type Declaration

`src/types/internal-modules.d.ts`:

```typescript
declare module 'bun:bundle' {
  export function feature(flag: string): boolean;
}
```

## 7. Adding New Features

### 1. 添加到 build.ts
```typescript
// build.ts
const defaultFeatures = [
  // ... existing features
  'NEW_FEATURE',
];
```

### 2. 在代码中使用
```typescript
import { feature } from 'bun:bundle';

if (feature('NEW_FEATURE')) {
  // New functionality
}
```

### 3. 环境变量控制
```bash
FEATURE_NEW_FEATURE=1 bun run dev
```

## 8. Feature Dependency

Features 可以有依赖关系：

```typescript
// ULTRAPLAN 依赖 VERIFICATION_AGENT
if (feature('ULTRAPLAN') && !feature('VERIFICATION_AGENT')) {
  console.warn('ULTRAPLAN requires VERIFICATION_AGENT');
}
```

## 9. Debugging Features

```typescript
// 列出所有启用的 features
console.log('Enabled features:', getEnabledFeatures());

// 检查特定 feature
console.log('BRIDGE_MODE:', feature('BRIDGE_MODE'));
```
