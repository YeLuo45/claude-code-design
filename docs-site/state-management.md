# State Management

> Zustand-style 状态管理 + React Context

## 1. State Architecture

```
┌─────────────────────────────────────────────────────────┐
│ State Management                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │ AppState   │◄───│ AppState   │───►│ Zustand    │ │
│  │ (Context)  │    │ Store      │    │ Store      │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│         │                  │                  │          │
│         ▼                  ▼                  ▼          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Bootstrap State (Module-level singletons)         ││
│  │ sessionId, cwd, projectRoot, tokenCounts          ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 2. AppState Type

`src/state/AppState.tsx` 定义中央应用状态：

```typescript
interface AppState {
  // Messages
  messages: Message[];
  pendingMessages: Message[];

  // Tools
  tools: Tool[];
  enabledTools: Set<string>;

  // Permissions
  permissionMode: PermissionMode;
  pendingPermissions: PendingPermission[];

  // MCP
  mcpConnections: Map<string, McpConnection>;
  mcpTools: Tool[];

  // Session
  sessionId: string;
  sessionStartTime: number;

  // UI State
  isLoading: boolean;
  currentTurn: number;
  error: Error | null;

  // Stats
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
}
```

## 3. Zustand Store

`src/state/store.ts` 创建 Zustand-style store：

```typescript
// 创建 store
export const createStore = () => {
  return create<AppState>((set, get) => ({
    // 初始状态
    messages: [],
    pendingMessages: [],
    tools: [],
    enabledTools: new Set(),
    permissionMode: PermissionMode.MANUAL_APPROVE,
    pendingPermissions: [],
    mcpConnections: new Map(),
    mcpTools: [],
    sessionId: generateSessionId(),
    sessionStartTime: Date.now(),
    isLoading: false,
    currentTurn: 0,
    error: null,
    tokenUsage: { input: 0, output: 0, total: 0 },

    // Actions
    addMessage: (message) =>
      set((state) => ({
        messages: [...state.messages, message],
      })),

    setTools: (tools) =>
      set({ tools }),

    updateTokenUsage: (usage) =>
      set((state) => ({
        tokenUsage: {
          ...state.tokenUsage,
          ...usage,
        },
      })),

    // ... more actions
  }));
};
```

## 4. Selectors

`src/state/selectors.ts` 提供状态选择器：

```typescript
// 消息选择器
export const selectMessages = (state: AppState) => state.messages;
export const selectLastMessage = (state: AppState) =>
  state.messages[state.messages.length - 1];

// Token 选择器
export const selectTokenUsage = (state: AppState) => state.tokenUsage;
export const selectTotalTokens = (state: AppState) =>
  state.tokenUsage.total;

// 工具选择器
export const selectTools = (state: AppState) => state.tools;
export const selectEnabledTools = (state: AppState) =>
  state.tools.filter((t) => state.enabledTools.has(t.name));

// MCP 选择器
export const selectMcpConnections = (state: AppState) =>
  Array.from(state.mcpConnections.values());
export const selectMcpTools = (state: AppState) => state.mcpTools;
```

## 5. Bootstrap State

`src/bootstrap/state.ts` 定义模块级单例：

```typescript
// Session-global state (module-level singletons)
export const sessionId: string = generateUUID();
export const cwd: string = process.cwd();
export const projectRoot: string = findProjectRoot(cwd);
export const tokenCounts: TokenCounts = { input: 0, output: 0, total: 0 };
export const modelOverrides: ModelOverride | null = null;
export const clientType: ClientType = detectClientType();
export const permissionMode: PermissionMode = loadPermissionMode();

// 工具函数
export function updateTokenCount(delta: TokenDelta): void {
  tokenCounts.input += delta.input;
  tokenCounts.output += delta.output;
  tokenCounts.total += delta.input + delta.output;
}

export function setModelOverride(model: string): void {
  modelOverrides = { model };
}
```

## 6. AppStateStore

`src/state/AppStateStore.ts` 提供默认 store：

```typescript
// 默认 store 实例
export const appStateStore = createStore();

// Hook for React components
export const useAppState = () => {
  const state = useStore(appStateStore);
  return state;
};

// Selector hooks
export const useMessages = () =>
  useAppState((state) => state.messages);
export const useTokenUsage = () =>
  useAppState((state) => state.tokenUsage);
```

## 7. State Flow

```
User Input
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ REPL.tsx                                                │
│  - 接收用户输入                                          │
│  - 调用 QueryEngine.query()                              │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ QueryEngine                                             │
│  - 更新 token usage                                     │
│  - 添加消息到状态                                        │
│  - 管理待处理权限                                        │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Zustand Store (appStateStore)                          │
│  - 状态更新触发 React 重新渲染                           │
│  - UI 自动反映最新状态                                  │
└─────────────────────────────────────────────────────────┘
```

## 8. Middleware

Zustand middleware 支持：

```typescript
import { persist } from 'zustand/middleware';

export const createPersistedStore = () => {
  return create<AppState>()(
    persist(
      (set, get) => ({ /* ... */ }),
      {
        name: 'claude-code-state',
        partialize: (state) => ({
          // 只持久化这些字段
          messages: state.messages,
          sessionId: state.sessionId,
        }),
      }
    )
  );
};
```

## 9. State Persistence

| Field | Persistence | Storage |
|-------|-------------|---------|
| `messages` | ✅ | LocalStorage |
| `sessionId` | ✅ | LocalStorage |
| `permissionMode` | ✅ | Config file |
| `tools` | ❌ | Memory only |
| `tokenUsage` | ❌ | Memory only |

## 10. Performance Optimization

```typescript
// 避免不必要的重新渲染
const MessageList = () => {
  const messages = useAppState(
    (state) => state.messages,
    shallow // 使用 shallow 比较
  );

  return <div>{/* ... */}</div>;
};

// Memoized selectors
const selectFilteredMessages = memoize(
  (state: AppState, filter: string) =>
    state.messages.filter((m) =>
      m.content.some((c) =>
        c.text?.includes(filter)
      )
    )
);
```
