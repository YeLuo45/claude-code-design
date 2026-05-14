# Bridge Mode

> Remote Control Server + ACP 协议，支持自托管和 Docker 部署

## 1. Bridge Mode Overview

```
┌─────────────────────────────────────────────────────────┐
│ Bridge Mode Architecture                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐         ┌─────────────┐              │
│  │ Claude Code │◄──────►│ Remote     │              │
│  │ CLI         │  WebSocket │Control Server│              │
│  └─────────────┘         └─────────────┘              │
│                                  │                       │
│          ┌───────────────────────┼───────────────────────┐
│          │                       │                       │
│          ▼                       ▼                       ▼
│  ┌─────────────┐         ┌─────────────┐    ┌─────────────┐
│  │ Web UI     │         │ ACP Agent   │    │ ACP Link   │
│  │(React+Vite)│         │ Bridge      │    │(Proxy)     │
│  └─────────────┘         └─────────────┘    └─────────────┘
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 2. Entry Points

Bridge Mode 通过多个入口启用：

```bash
# 所有这些命令启用 Bridge Mode
claude remote-control
claude rc
claude remote
claude sync
claude bridge
```

## 3. Remote Control Server

`packages/remote-control-server/` 是自托管 RCS：

### Features
| Feature | Description |
|---------|-------------|
| Web UI | React 19 + Vite + Radix UI 控制面板 |
| Docker | 支持 Docker 部署 |
| ACP Agent | 支持 ACP agent 接入 |
| WebSocket | 实时消息传输 |
| REST API | 配置管理接口 |

### Running RCS

```bash
# 直接运行
bun run rcs

# Docker 部署
docker run -p 8080:8080 claude-code-rcs
```

### Web UI
- 连接状态监控
- 会话管理
- 实时日志
- 配置编辑

## 4. ACP Protocol

`src/services/acp/` 实现 Agent Client Protocol：

### Components
| Component | File | Description |
|-----------|------|-------------|
| ACP Agent | `agent.ts` | AcpAgent 类 |
| Bridge | `bridge.ts` | Claude Code ↔ ACP 桥接 |
| Permissions | `permissions.ts` | 权限处理 |
| Entry | `entry.ts` | 入口点 |

### ACP Message Types
```typescript
type AcpMessage =
  | { type: 'session/start'; sessionId: string }
  | { type: 'session/end'; sessionId: string }
  | { type: 'tool/call'; tool: string; input: unknown }
  | { type: 'tool/result'; result: unknown }
  | { type: 'plan/update'; plan: Plan }
  | { type: 'session/update_plan'; plan: Plan };
```

## 5. ACP Link

`packages/acp-link/` 是 ACP 代理服务器：

### Features
- WebSocket 客户端桥接到 ACP agent
- 自定义端口/HTTPS/认证
- 会话管理
- RCS 集成
- 权限模式透传

### CLI Usage
```bash
acp-link --port 8080 --auth mytoken
```

## 6. Bridge API

`src/bridge/` 包含 Bridge 模式实现：

### Components
| Component | Description |
|-----------|-------------|
| `bridgeApi.ts` | Bridge API 端点 |
| `sessionManager.ts` | 会话管理 |
| `jwtAuth.ts` | JWT 认证 |
| `messageTransport.ts` | 消息传输 |
| `permissionCallbacks.ts` | 权限回调 |

### Authentication
```typescript
// JWT 认证流程
const token = await authenticate({
  apiKey: process.env.CLAUDE_CODE_API_KEY,
});

const session = await bridgeApi.createSession({
  token,
  capabilities: ['tools', 'plan'],
});
```

## 7. Plan Visualization

ACP Plan 可视化支持：

```typescript
// PlanView 组件显示
interface PlanViewProps {
  plan: Plan;
  progress: number;        // 0-100
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}
```

### Session Plan Messages
支持 `session/update plan` 类型消息展示：
- 进度条
- 状态图标
- 优先级标签

## 8. Permission Mode in Bridge

Bridge 模式下的权限管道：

```
Client Permission Mode
    │
    ├─► 传递给 acp-link
    │
    ├─► 优先级: 客户端传值 > config > ACP_PERMISSION_MODE 环境变量
    │
    └─► 透传到 Claude Code
```

### Permission Flow
```typescript
const effectivePermission = sessionPermissionMode ??
  config.permissionMode ??
  process.env.ACP_PERMISSION_MODE;
```

## 9. Docker Deployment

RCS Docker 部署：

```dockerfile
FROM oven/bun:1.0 AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build

FROM base AS runner
WORKDIR /app
COPY --from=base /app/dist ./dist
EXPOSE 8080
CMD ["bun", "run", "rcs"]
```

### Docker Compose
```yaml
services:
  rcs:
    build: .
    ports:
      - "8080:8080"
    environment:
      - API_KEY=${API_KEY}
      - PORT=8080
```

## 10. Connection Flow

```
1. 启动 RCS
   │
   ▼
2. Claude Code 连接
   claude rc --api-key <key>
   │
   ▼
3. WebSocket 握手
   │
   ▼
4. 认证 (JWT)
   │
   ▼
5. 会话建立
   │
   ▼
6. 消息双向传输
   - Claude Code → RCS → Web UI
   - Web UI → RCS → Claude Code
```

## 11. Feature Flag

Bridge Mode 由 `BRIDGE_MODE` feature flag 控制：

```typescript
import { feature } from 'bun:bundle';

if (feature('BRIDGE_MODE')) {
  // 加载 Bridge 模块
  await import('./bridge/bridgeMain.ts');
}
```

启用方式：`FEATURE_BRIDGE_MODE=1 bun run dev`
