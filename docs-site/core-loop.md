# Core Loop

> QueryEngine + query 函数实现流式 API 调用和工具调用循环

## 1. Core Loop Overview

```
User Input
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ QueryEngine.query()                                      │
│                                                          │
│  1. 构建请求 (system prompt, messages, tools)            │
│  2. 调用 API (query.ts)                                 │
│  3. 处理流式响应                                         │
│  4. 执行工具调用                                         │
│  5. 管理会话状态                                         │
│  6. 上下文压缩 (compaction)                             │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Tool Result
    │
    ├─► 继续循环 → 返回步骤 2
    │
    └─► 完成 → 显示响应给用户
```

## 2. QueryEngine

`src/QueryEngine.ts` 是高级封装，管理对话状态：

### Responsibilities

| Responsibility | Description |
|----------------|-------------|
| 会话状态 | 管理对话历史、上下文 |
| Compaction | 上下文压缩以节省 token |
| 文件快照 | 文件历史快照 |
| Attribution | 结果归因 |
| Turn 记账 | 轮次级别 bookkeeping |

### API

```typescript
class QueryEngine {
  // 核心查询方法
  async query(
    messages: Message[],
    options: QueryOptions
  ): Promise<QueryResult>;

  // 上下文压缩
  async compact(): Promise<void>;

  // 文件快照
  snapshotFiles(paths: string[]): Promise<FileSnapshot[]>;
}
```

## 3. query.ts — Core API Function

`src/query.ts` 是主要的 API 查询函数：

### Responsibilities

| Responsibility | Description |
|----------------|-------------|
| API 调用 | 发送消息到 Claude API |
| 流处理 | 处理 `BetaRawMessageStreamEvent` 流事件 |
| 工具调用 | 解析和执行工具调用 |
| 对话循环 | 管理单个对话轮次 |

### Request Building

```typescript
// 构建请求参数
interface QueryParams {
  systemPrompt: string;      // 系统提示
  messages: Message[];       // 对话消息
  tools: Tool[];            // 可用工具
  betas?: string[];          // Beta 特性
  modelOverride?: string;     // 模型覆盖
}
```

### Streaming Response

```typescript
// 处理流式响应
for await (const event of claudeApi.stream(params)) {
  switch (event.type) {
    case 'content_block_delta':
      // 流式文本输出
      yield event.delta.text;
      break;
    case 'content_block_start':
      // 工具调用开始
      startToolCall(event.content_block);
      break;
    case 'content_block_delta':
      if (event.delta.type === 'input_json_delta') {
        // 工具输入
        appendToolInput(event.delta.partial_json);
      }
      break;
    case 'content_block_stop':
      // 工具调用完成
      executeToolCall(event.tool_use);
      break;
  }
}
```

## 4. REPL Screen

`src/screens/REPL.tsx` 是交互式 REPL 屏幕：

### Responsibilities

| Responsibility | Description |
|----------------|-------------|
| 用户输入 | 处理用户文本输入 |
| 消息显示 | 渲染对话消息 |
| 工具权限 | 显示工具权限审批 UI |
| 快捷键 | 处理键盘快捷键 |

### Key Features

```typescript
// 快捷键处理
const shortcuts = {
  'Ctrl+C': () => cancelCurrentTask(),
  'Ctrl+Z': () => suspendSession(),
  'Ctrl+L': () => clearScreen(),
  'Up/Down': () => navigateHistory(),
};

// 工具权限审批
if (toolPermissionRequired(tool)) {
  // 显示权限对话框
  const approved = await showPermissionDialog(tool);
  if (!approved) {
    skipToolCall(tool);
    continue;
  }
}
```

## 5. Message Types

`src/types/message.ts` 定义消息类型层次：

| Type | Description |
|------|-------------|
| `UserMessage` | 用户输入消息 |
| `AssistantMessage` | AI 助手消息 |
| `SystemMessage` | 系统消息 |
| `ToolResultMessage` | 工具执行结果 |
| `TextContent` | 文本内容块 |
| `ToolUseContent` | 工具调用内容块 |

## 6. Tool Call Flow

```
1. API 返回 content_block_stop 事件
   │
   ▼
2. 解析 tool_use 内容
   │
   ▼
3. 检查权限 (PermissionMode)
   │
   ├─► APPROVED → 执行工具
   ├─► DENIED → 跳过，返回拒绝消息
   └─► PROMPT → 显示 UI，等待用户确认
               │
               ├─► APPROVED → 执行工具
               └─► DENIED → 跳过
   │
   ▼
4. 执行工具 (builtin tools 或 MCP tools)
   │
   ▼
5. 将结果作为新消息发送回 API
   │
   ▼
6. 继续处理下一个响应或完成
```

## 7. Context Compaction

当上下文过长时自动压缩：

```typescript
class QueryEngine {
  private async compact(): Promise<void> {
    // 1. 识别可压缩的消息
    const messagesToCompact = this.identifyCompressibleMessages();

    // 2. 生成摘要
    const summary = await this.summarize(messagesToCompact);

    // 3. 替换原消息为摘要
    this.messages = this.replaceWithSummary(
      messagesToCompact,
      summary
    );
  }
}
```

## 8. Error Handling

```typescript
async function queryLoop(
  params: QueryParams
): AsyncGenerator<QueryEvent> {
  try {
    for await (const event of stream) {
      yield event;
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      // 等待后重试
      await sleep(error.retryAfter);
      yield* queryLoop(params);
    } else if (error instanceof ContextTooLongError) {
      // 尝试压缩上下文
      await queryEngine.compact();
      yield* queryLoop(params);
    } else {
      throw error;
    }
  }
}
```

## 9. Turn-Level Bookkeeping

```typescript
interface TurnStats {
  turnId: string;
  startTime: number;
  endTime?: number;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  toolCalls: ToolCall[];
  errors: Error[];
}
```
