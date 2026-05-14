# Architecture

> Claude Code 核心架构：基于 Bun 的终端 AI 编程 CLI

## 1. Overview

| 指标 | 数值 |
|------|------|
| 运行时 | Bun (非 Node.js) |
| 语言 | TypeScript (strict mode) |
| 模块系统 | ESM + TSX |
| Workspace 包 | 15+ 个 |
| 内置工具 | 60 个 |
| Feature Flags | 19 个 |
| API Providers | 7 种 |
| 版本 | 2.1.888 |

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Claude Code CLI                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  CLI Entry  │───►│  Main.tsx  │───►│  REPL Screen│        │
│  │ cli.tsx     │    │ (Commander) │    │  (Ink UI)   │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                  │                  │                  │
│         ▼                  ▼                  ▼                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              QueryEngine + query()                   │       │
│  │         (Core Loop - API 调用 + 工具执行)             │       │
│  └─────────────────────────────────────────────────────┘       │
│                            │                                      │
│         ┌──────────────────┼──────────────────┐                 │
│         ▼                  ▼                  ▼                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │ Tool System │    │  API Layer  │    │State Manager│        │
│  │(59 tools)   │    │(7 providers)│    │  (Zustand)  │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Entry & Bootstrap Flow

```
cli.tsx main()
    │
    ├─► --version / -v          → 零模块加载，输出版本号
    │
    ├─► --dump-system-prompt    → Feature-gated (DUMP_SYSTEM_PROMPT)
    │
    ├─► --computer-use-mcp      → 独立 MCP server 模式
    │
    ├─► remote-control/rc/bridge → Feature-gated (BRIDGE_MODE)
    │
    ├─► daemon [subcommand]     → Feature-gated (DAEMON)
    │
    ├─► ps/logs/attach/kill   → Feature-gated (BG_SESSIONS)
    │
    ├─► new/list/reply          → Template job commands
    │
    └─► 默认路径: main.tsx
              │
              ▼
        ┌─────────────┐
        │ Commander.js │ ─── 注册所有 subcommands
        │   (~6981行)  │
        └─────────────┘
              │
              ▼
        ┌─────────────┐
        │ init.ts     │ ─── 遥测/配置/信任对话框
        └─────────────┘
              │
              ▼
        ┌─────────────┐
        │  REPL.tsx   │ ─── 交互式终端 UI
        └─────────────┘
```

## 4. Core Loop

```
User Input
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ QueryEngine                                              │
│  1. 构建请求参数 (system prompt, messages, tools)        │
│  2. 调用 query()                                        │
│  3. 处理流式响应                                          │
│  4. 执行工具调用                                          │
│  5. 管理会话状态/压缩                                      │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ query.ts                                                 │
│  • 发送消息到 Claude API                                 │
│  • 处理 BetaRawMessageStreamEvent 流事件                │
│  • 管理对话轮次循环                                        │
└─────────────────────────────────────────────────────────┘
    │
    ▼
Tool Calls (59 builtin tools + MCP tools)
    │
    ▼
Response to User
```

## 5. Tool System

| Category | Tools | Examples |
|----------|-------|----------|
| 文件操作 | 5 | FileReadTool, FileWriteTool, GlobTool, GrepTool |
| Shell/执行 | 3 | BashTool, PowerShellTool, REPLTool |
| Agent 系统 | 5 | AgentTool, TaskCreateTool, TaskListTool |
| 规划 | 3 | EnterPlanModeTool, ExitPlanModeV2Tool |
| Web/MCP | 4 | WebFetchTool, WebSearchTool, MCPTool |
| 调度 | 3 | CronCreateTool, CronDeleteTool, CronListTool |
| 其他 | 40+ | LSPTool, ConfigTool, SkillTool, etc. |

## 6. API Layer

### 7 Providers

| Provider | Source | Environment Variable |
|----------|--------|---------------------|
| firstParty | Anthropic Direct | 默认 |
| bedrock | AWS Bedrock | AWS_* |
| vertex | Google Cloud | GOOGLE_*, VERTEX_* |
| foundry | Microsoft Foundry | FOUNDRY_* |
| openai | OpenAI Compatible | OPENAI_* |
| gemini | Google Gemini | GEMINI_* |
| grok | xAI Grok | GROK_* |

### Provider Selection
```
modelType 参数 > 环境变量 > 默认 firstParty
```

## 7. State Management

```
AppState (Zustand Store)
  ├── messages[]           # 对话消息
  ├── tools[]             # 可用工具列表
  ├── permissions         # 权限状态
  ├── mcpConnections      # MCP 连接
  ├── sessionId           # 会话 ID
  ├── cwd / projectRoot   # 工作目录
  └── tokenCounts         # Token 统计
```

## 8. UI Layer (Ink)

```
packages/@ant/ink/ (Forked Ink framework)
  ├── components/         # React 组件
  ├── core/              # Ink 核心
  ├── hooks/             # 自定义 hooks
  ├── keybindings/       # 键盘绑定
  └── theme/             # 主题系统

src/components/
  ├── App.tsx            # Root provider
  ├── Messages.tsx       # 对话消息渲染
  ├── PromptInput/       # 用户输入处理
  ├── permissions/        # 权限审批 UI
  └── design-system/     # 复用 UI 组件
```

## 9. Feature Flags

| Flag | Category | Description |
|------|----------|-------------|
| BUDDY | Basic | Buddy 模式 |
| BRIDGE_MODE | Basic | Bridge/Remote Control |
| AGENT_TRIGGERS | P0 Local | Agent 触发器 |
| ULTRATHINK | P0 Local | 深度思考模式 |
| BUILTIN_EXPLORE_PLAN_AGENTS | P0 Local | 内置探索计划 Agent |
| EXTRACT_MEMORIES | P1 API | 记忆提取 |
| VERIFICATION_AGENT | P1 API | 验证 Agent |
| KAIROS_BRIEF | P1 API | Kairos 简报 |
| AWAY_SUMMARY | P1 API | 离开摘要 |
| ULTRAPLAN | P1 API | 超级计划 |
| DAEMON | P2 | Daemon 模式 |
| SHOT_STATS | Stats | 射击统计 |
| PROMPT_CACHE_BREAK_DETECTION | Cache | 提示缓存检测 |
| TOKEN_BUDGET | Budget | Token 预算 |

## 10. Workspace Packages

| Package | Purpose |
|---------|---------|
| `@ant/ink/` | Forked Ink 框架 |
| `@ant/computer-use-mcp/` | Computer Use MCP Server |
| `@ant/computer-use-input/` | 键鼠模拟 |
| `@ant/computer-use-swift/` | 截图 + 应用管理 |
| `@ant/claude-for-chrome-mcp/` | Chrome 控制 |
| `@ant/model-provider/` | Model Provider 抽象层 |
| `builtin-tools/` | 60 个内置工具 |
| `agent-tools/` | Agent 工具集 |
| `acp-link/` | ACP 代理服务器 |
| `mcp-client/` | MCP 客户端库 |
| `remote-control-server/` | 自托管 RCS |

## 11. Build System

```
build.ts (Bun.build)
    │
    ├── splitting: true
    ├── entry: src/entrypoints/cli.tsx
    └── output: dist/cli.js + chunk files
              │
              ▼
    import.meta.require 替换为 Node.js 兼容版本
              │
              ▼
    dist/cli.js (bun/node 都可运行)
```

## 12. Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Language | TypeScript (strict) |
| UI | React + Ink (终端) |
| State | Zustand |
| CLI | Commander.js |
| API | @anthropic-ai/sdk |
| Build | Bun.build |
| Lint | Biome |
| Test | bun:test |
