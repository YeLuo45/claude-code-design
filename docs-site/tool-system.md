# Tool System

> 59 个内置工具 + MCP 工具，完整工具注册和执行体系

## 1. Tool Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Tool System                                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │ Tool.ts     │───►│ tools.ts    │───►│ tools.ts    │ │
│  │ (Interface) │    │ (Registry)  │    │ (Execution) │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                          │                               │
│                          ▼                               │
│  ┌─────────────────────────────────────────────────────┐│
│  │ @claude-code-best/builtin-tools                     ││
│  │ (59 tool implementations)                          ││
│  └─────────────────────────────────────────────────────┘│
│                          │                               │
│                          ▼                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │ File Ops    │    │ Shell       │    │ Agent       │ │
│  │ 5 tools     │    │ 3 tools     │    │ 5 tools     │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │ Planning    │    │ Web/MCP     │    │ Cron        │ │
│  │ 3 tools     │    │ 4 tools     │    │ 3 tools     │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 2. Tool Interface

`src/Tool.ts` 定义 Tool 类型：

```typescript
interface Tool {
  name: string;              // 工具名称
  description: string;       // 工具描述
  input_schema: JSONSchema;  // 输入模式
  fn: ToolFunction;          // 执行函数

  // 可选属性
  category?: ToolCategory;
  permissionMode?: PermissionMode;
  timeout?: number;
}

type ToolFunction = (
  input: unknown,
  context: ToolContext
) => Promise<ToolResult>;
```

## 3. Tool Registry

`src/tools.ts` 是工具注册表：

```typescript
// 工具注册
const tools = [
  // 文件操作
  FileReadTool,
  FileWriteTool,
  FileEditTool,
  GlobTool,
  GrepTool,

  // Shell/执行
  BashTool,
  PowerShellTool,
  REPLTool,

  // Agent 系统
  AgentTool,
  TaskCreateTool,
  TaskUpdateTool,
  TaskListTool,
  TaskGetTool,

  // 规划
  EnterPlanModeTool,
  ExitPlanModeV2Tool,
  VerifyPlanExecutionTool,

  // Web/MCP
  WebFetchTool,
  WebSearchTool,
  MCPTool,
  McpAuthTool,

  // 调度
  CronCreateTool,
  CronDeleteTool,
  CronListTool,

  // ... 其他 40+ 工具
];
```

## 4. Tool Categories

### 文件操作 (5 tools)

| Tool | Description |
|------|-------------|
| `FileReadTool` | 读取文件内容 |
| `FileWriteTool` | 写入文件内容 |
| `FileEditTool` | 编辑文件 (diff) |
| `GlobTool` | 文件模式匹配 |
| `GrepTool` | 内容搜索 |

### Shell/执行 (3 tools)

| Tool | Description |
|------|-------------|
| `BashTool` | 执行 Bash 命令 |
| `PowerShellTool` | 执行 PowerShell |
| `REPLTool` | 交互式 REPL |

### Agent 系统 (5 tools)

| Tool | Description |
|------|-------------|
| `AgentTool` | 创建子 Agent |
| `TaskCreateTool` | 创建任务 |
| `TaskUpdateTool` | 更新任务状态 |
| `TaskListTool` | 列出任务 |
| `TaskGetTool` | 获取任务详情 |

### 规划 (3 tools)

| Tool | Description |
|------|-------------|
| `EnterPlanModeTool` | 进入规划模式 |
| `ExitPlanModeV2Tool` | 退出规划模式 |
| `VerifyPlanExecutionTool` | 验证计划执行 |

### Web/MCP (4 tools)

| Tool | Description |
|------|-------------|
| `WebFetchTool` | 获取网页内容 |
| `WebSearchTool` | 搜索网页 |
| `MCPTool` | 调用 MCP 工具 |
| `McpAuthTool` | MCP 认证 |

### 调度 (3 tools)

| Tool | Description |
|------|-------------|
| `CronCreateTool` | 创建定时任务 |
| `CronDeleteTool` | 删除定时任务 |
| `CronListTool` | 列出定时任务 |

### 其他 (40+ tools)

| Tool | Description |
|------|-------------|
| `LSPTool` | LSP 服务器交互 |
| `ConfigTool` | 配置管理 |
| `SkillTool` | Skill 管理 |
| `EnterWorktreeTool` | 进入 worktree |
| `ExitWorktreeTool` | 退出 worktree |

## 5. Tool Execution

```typescript
async function executeTool(
  tool: Tool,
  input: unknown,
  context: ToolContext
): Promise<ToolResult> {
  // 1. 权限检查
  const permission = await checkPermission(tool, context);
  if (!permission.granted) {
    return {
      success: false,
      error: `Permission denied: ${permission.reason}`,
    };
  }

  // 2. 超时控制
  const timeout = tool.timeout ?? 30000;
  const result = await withTimeout(
    tool.fn(input, context),
    timeout
  );

  // 3. 结果记录
  await recordToolExecution(tool, input, result);

  return result;
}
```

## 6. Permission Modes

`src/types/permissions.ts` 定义权限模式：

```typescript
enum PermissionMode {
  // 自动批准所有工具
  AUTO_APPROVE = 'auto_approve',

  // 手动批准所有工具
  MANUAL_APPROVE = 'manual_approve',

  // 按工具类型批准
  TOOL_TYPE_BASED = 'tool_type_based',

  // 只读模式
  READ_ONLY = 'read_only',

  // 无限制
  UNRESTRICTED = 'unrestricted',
}
```

## 7. MCP Tool Integration

MCP 工具通过 `MCPTool` 集成：

```typescript
// MCP 工具发现
const mcpTools = await mcpClient.discoverTools();

// 注册到工具列表
for (const mcpTool of mcpTools) {
  const wrappedTool = wrapMcpTool(mcpTool);
  toolRegistry.register(wrappedTool);
}

// MCP 工具调用
async function callMcpTool(
  tool: McpTool,
  input: unknown
): Promise<ToolResult> {
  const result = await mcpClient.callTool(
    tool.name,
    input
  );
  return parseMcpResult(result);
}
```

## 8. Tool Shared Utilities

`src/tools/shared/` 和 `packages/builtin-tools/src/tools/shared/` 包含共享工具函数：

| Utility | Description |
|---------|-------------|
| `fileUtils` | 文件操作辅助函数 |
| `commandUtils` | 命令执行辅助函数 |
| `validation` | 输入验证 |
| `errorHandling` | 错误处理 |

## 9. Tool Result Format

```typescript
interface ToolResult {
  success: boolean;
  content?: ContentBlock[];
  error?: string;
  metadata?: {
    duration: number;
    tokenUsage?: TokenUsage;
    cacheHit?: boolean;
  };
}

type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; source: ImageSource }
  | { type: 'resource'; resource: Resource };
```

## 10. Built-in Tools Package

`packages/builtin-tools/` 是独立的 npm 包：

```
packages/builtin-tools/
├── src/
│   ├── tools/
│   │   ├── file/
│   │   │   ├── FileReadTool.ts
│   │   │   ├── FileWriteTool.ts
│   │   │   └── ...
│   │   ├── shell/
│   │   ├── agent/
│   │   ├── planning/
│   │   ├── web/
│   │   ├── cron/
│   │   └── shared/
│   └── index.ts          # 导出所有工具
├── package.json
└── tsconfig.json
```

## 11. Custom Tools

用户可以添加自定义工具：

```typescript
// 注册自定义工具
toolRegistry.register({
  name: 'my-custom-tool',
  description: 'A custom tool',
  input_schema: {
    type: 'object',
    properties: {
      arg1: { type: 'string' },
    },
  },
  fn: async (input, context) => {
    // 实现逻辑
    return { success: true, content: [...] };
  },
});
```
