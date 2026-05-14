# Code Structure

> Claude Code 完整目录结构

## 1. Top-Level Structure

```
claude-code/
├── src/
│   ├── entrypoints/          # CLI 入口点
│   ├── components/          # React 组件
│   ├── screens/              # Ink 屏幕
│   ├── services/             # API 和服务
│   ├── state/                # 状态管理
│   ├── tools.ts              # 工具注册
│   ├── query.ts              # 核心查询
│   ├── QueryEngine.ts        # 查询引擎
│   ├── main.tsx             # Commander 定义
│   ├── ink.ts               # Ink 包装器
│   └── ...
├── packages/                 # Workspace 包
│   ├── @ant/               # Anthropic 内部包
│   ├── builtin-tools/       # 内置工具
│   ├── agent-tools/         # Agent 工具
│   ├── acp-link/           # ACP 代理
│   ├── mcp-client/         # MCP 客户端
│   ├── mcp-server/         # MCP 服务端
│   ├── remote-control-server/ # RCS
│   └── ...
├── tests/                   # 集成测试
├── docs/                    # 文档
└── scripts/                 # 构建脚本
```

## 2. Entry Points

```
src/entrypoints/
├── cli.tsx              # True entrypoint
├── init.ts              # 初始化
└── ...
```

## 3. Core Files

| File | Lines | Purpose |
|------|-------|---------|
| `src/main.tsx` | ~6981 | Commander.js CLI 定义 |
| `src/query.ts` | - | 核心 API 查询 |
| `src/QueryEngine.ts` | - | 查询引擎封装 |
| `src/tools.ts` | - | 工具注册表 |
| `src/context.ts` | - | 上下文构建 |
| `src/Tool.ts` | - | Tool 接口定义 |

## 4. Services

```
src/services/
├── api/
│   ├── claude.ts       # Anthropic API
│   ├── openai/         # OpenAI 兼容
│   ├── gemini/         # Gemini 兼容
│   ├── grok/           # Grok 兼容
│   ├── bedrock/        # AWS Bedrock
│   ├── vertex/         # Google Vertex
│   └── foundry/        # MS Foundry
└── acp/                # ACP 协议
```

## 5. Components

```
src/components/
├── App.tsx             # Root provider
├── Messages.tsx        # 消息渲染
├── MessageRow.tsx      # 单条消息
├── PromptInput/        # 输入处理
├── permissions/        # 权限 UI
└── design-system/      # 设计系统
```

## 6. State

```
src/state/
├── AppState.tsx        # AppState 类型
├── AppStateStore.ts    # Store 工厂
├── store.ts           # Zustand store
└── selectors.ts       # 选择器
```

## 7. Packages

### @ant Packages
```
packages/@ant/
├── ink/                # Forked Ink 框架
├── computer-use-mcp/   # Computer Use MCP
├── computer-use-input/ # 键鼠模拟
├── computer-use-swift/ # 截图 + 应用
├── claude-for-chrome-mcp/ # Chrome 控制
└── model-provider/     # Provider 抽象
```

### Tool Packages
```
packages/
├── builtin-tools/      # 60 个内置工具
├── agent-tools/        # Agent 工具
├── mcp-client/         # MCP 客户端库
├── mcp-server/         # MCP 服务端库
├── acp-link/           # ACP 代理
└── remote-control-server/ # 自托管 RCS
```

## 8. Tests

```
tests/
├── mocks/              # Mock 工具
│   ├── log.ts
│   ├── debug.ts
│   └── ...
└── integration/        # 集成测试
    ├── cli-arguments.test.ts
    ├── context-build.test.ts
    ├── message-pipeline.test.ts
    └── tool-chain.test.ts
```

## 9. Build Scripts

```
scripts/
├── dev.ts              # Dev 模式入口
├── defines.ts          # Feature defines
└── build.ts            # 构建脚本
```

## 10. Documentation

```
docs/
├── testing-spec.md     # 测试规范
├── features/
│   └── remote-control-self-hosting.md
└── ...
```
