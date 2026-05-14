# Entry & Bootstrap

> Claude Code 启动流程：从 CLI 入口到 REPL 初始化的完整链路

## 1. Entry Points

### cli.tsx — True Entrypoint

`src/entrypoints/cli.tsx` 是真正的入口点，`main()` 函数按优先级处理多条快速路径：

```typescript
// 按优先级顺序处理
main()
  ├─► --version / -v           → 零模块加载，输出版本
  ├─► --dump-system-prompt     → Feature-gated (DUMP_SYSTEM_PROMPT)
  ├─► --claude-in-chrome-mcp  → Chrome MCP 模式
  ├─► --computer-use-mcp      → 独立 MCP server 模式
  ├─► --daemon-worker=<kind>  → Feature-gated (DAEMON)
  ├─► remote-control/rc/...   → Feature-gated (BRIDGE_MODE)
  ├─► daemon [subcommand]     → Feature-gated (DAEMON)
  ├─► ps/logs/attach/kill    → Feature-gated (BG_SESSIONS)
  ├─► new/list/reply         → Template job commands
  ├─► environment-runner      → BYOC runner
  └─► 默认路径 → main.tsx
```

### 快速路径优势

| 路径 | 模块加载 | 用途 |
|------|---------|------|
| `--version` | 零加载 | 版本检查 |
| `--dump-system-prompt` | 最小 | 调试用 |
| `ps/logs/attach` | 部分 | 会话管理 |
| 默认 | 完整 | 完整 CLI |

## 2. main.tsx — Commander.js CLI

`src/main.tsx` (~6981 行) 使用 Commander.js 定义所有子命令：

### Subcommands

| Command | Description |
|---------|-------------|
| `mcp` | MCP server/add/remove/list |
| `server` | 服务器管理 |
| `ssh` | SSH 连接 |
| `open` | 打开文件/URL |
| `auth` | 认证管理 |
| `plugin` | 插件管理 |
| `agents` | Agent 管理 |
| `auto-mode` | 自动模式 |
| `doctor` | 健康检查 |
| `update` | 更新 |

### Action Handler

主 `.action()` 处理器负责：
1. 权限检查
2. MCP 初始化
3. 会话恢复
4. REPL/Headless 模式分发

## 3. init.ts — One-time Initialization

`src/entrypoints/init.ts` 执行一次性初始化：

```typescript
// 初始化流程
init()
  ├─► Telemetry setup     → 遥测配置
  ├─► Config loading     → 加载配置
  └─► Trust dialog       → 信任对话框 (首次运行)
```

## 4. Bootstrap State

`src/bootstrap/state.ts` 定义模块级单例：

```typescript
// Session-global state
export const sessionId: string;        // 会话 ID
export const cwd: string;              // 当前工作目录
export const projectRoot: string;     // 项目根目录
export const tokenCounts: TokenCounts; // Token 统计
export const modelOverrides: ModelOverride; // 模型覆盖
export const clientType: ClientType;   // 客户端类型
export const permissionMode: PermissionMode; // 权限模式
```

## 5. Module Loading Strategy

```
cli.tsx
    │
    ├── --version        → 直接输出，零模块加载
    ├── --dump-system-prompt → 只加载 context.ts
    └── 其他              → 加载 main.tsx
                              │
                              ├── Commander.js 注册
                              ├── init.ts 初始化
                              └── 启动 REPL 或 Headless
```

## 6. Feature-Gated Loading

Feature flags 控制模块加载：

```typescript
// 示例：BRIDGE_MODE feature
if (feature('BRIDGE_MODE')) {
  // 加载 bridge 相关模块
  import('./bridge/bridgeMain.ts');
}

// DAEMON feature
if (feature('DAEMON')) {
  // 加载 daemon 模块
  import('./daemon/main.ts');
}
```

## 7. Dev vs Build Mode

### Dev Mode
```bash
bun run dev
# scripts/dev.ts 通过 -d flag 注入 MACRO.* defines
```

### Build Mode
```bash
bun run build
# build.ts 执行 Bun.build() with splitting: true
```

## 8. Environment Variables

| Variable | Description |
|----------|-------------|
| `BUN_INSPECT` | 调试端口 |
| `FEATURE_<FLAG>` | 启用特定 feature |
| `CLAUDE_CODE_USE_OPENAI` | 使用 OpenAI 兼容层 |
| `CLAUDE_CODE_USE_GEMINI` | 使用 Gemini 兼容层 |
| `CLAUDE_CODE_USE_GROK` | 使用 Grok 兼容层 |

## 9. Error Handling

启动错误处理流程：

```
cli.tsx main()
    │
    ▼
try {
  // 执行启动逻辑
} catch (error) {
  if (error instanceof CliError) {
    // 已知的 CLI 错误
    outputError(error.message);
    exit(error.exitCode);
  } else {
    // 未知错误
    outputError('Internal error');
    exit(1);
  }
}
```
