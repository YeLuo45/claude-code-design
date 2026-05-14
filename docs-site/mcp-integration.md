# MCP Integration

> Model Context Protocol 支持 — 内置 MCP Server/Client + Claude Code Chrome 扩展

## 1. MCP Architecture

```
┌─────────────────────────────────────────────────────────┐
│ MCP Integration                                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │ MCP Server │    │ MCP Client  │    │Chrome MCP  │ │
│  │(serve)     │    │(tools)      │    │(extension) │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            ▼                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ MCPTool (builtin tool)                              │ │
│  │ - 封装 MCP 调用为标准工具接口                        │ │
│  └─────────────────────────────────────────────────────┘ │
│                            │                               │
│                            ▼                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Tool Registry                                        │ │
│  │ - MCP tools 注册到主工具列表                        │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 2. MCP Commands

Claude Code 提供 `mcp` 子命令：

```bash
# 启动 MCP 服务器
claude mcp serve [--port <port>]

# 添加 MCP 服务器
claude mcp add <server-name> <command> [args...]

# 列出已配置的 MCP 服务器
claude mcp list

# 删除 MCP 服务器
claude mcp remove <server-name>
```

## 3. MCP Server Mode

### Standalone Mode
```bash
claude --computer-use-mcp
# 启动独立的 MCP server，不启动完整 CLI
```

### With CLI
```bash
claude mcp serve
# 在 CLI 中启动 MCP 服务器
```

## 4. MCP Client Integration

MCP 客户端集成到工具系统：

```typescript
// 发现可用的 MCP 工具
const mcpTools = await mcpClient.discoverTools({
  serverName: 'my-server',
});

// 包装为标准工具
for (const tool of mcpTools) {
  const wrappedTool: Tool = {
    name: `mcp_${tool.name}`,
    description: tool.description,
    input_schema: tool.inputSchema,
    fn: async (input, context) => {
      const result = await mcpClient.callTool(
        tool.name,
        input
      );
      return wrapMcpResult(result);
    },
  };

  toolRegistry.register(wrappedTool);
}
```

## 5. Claude for Chrome Extension

`packages/@ant/claude-for-chrome-mcp/` 支持 Chrome 扩展：

```bash
# 启用 Chrome MCP
claude --claude-in-chrome-mcp
```

### Capabilities
- 控制 Chrome 浏览器
- 截取页面内容
- 读写剪贴板
- 模拟键鼠输入

## 6. Computer Use MCP

`packages/@ant/computer-use-mcp/` 提供完整 computer use：

### Tools
| Tool | Description |
|------|-------------|
| `computer_vision` | 屏幕截图分析 |
| `computer_control` | 键鼠控制 |
| `clipboard_read` | 读剪贴板 |
| `clipboard_write` | 写剪贴板 |
| `app_management` | 应用管理 |

### Platforms
- macOS (完整支持)
- Windows (部分支持)
- Linux (部分支持)

## 7. MCP Auth

`McpAuthTool` 处理 MCP 认证：

```typescript
interface McpAuthParams {
  server: string;        // 服务器名称
  authType: 'oauth' | 'api_key' | 'bearer';
  credentials: {
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    token?: string;
  };
}
```

## 8. MCP Configuration

`~/.config/claude-code/mcp.json`:

```json
{
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

## 9. MCP in Claude Code Chrome

通过 `--chrome-native-host` 启用原生 Chrome 集成：

```bash
claude --chrome-native-host
```

### Features
- 连接已安装的 Claude Chrome 扩展
- 直接在浏览器中操作
- 页面内容自动同步

## 10. ACP Protocol Bridge

MCP 可以通过 ACP 协议桥接：

```typescript
// ACP → MCP 桥接
const acpBridge = new AcpMcpBridge({
  acpAgent: acpAgent,
  mcpClient: mcpClient,
});

// 转发 ACP 消息到 MCP
acpBridge.on('tool_call', async (call) => {
  const result = await mcpClient.callTool(call.name, call.input);
  acpBridge.sendToolResult(call.id, result);
});
```
