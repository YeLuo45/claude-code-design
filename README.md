# Claude Code Design

Design documentation site for [claude-code](https://github.com/anthropics/claude-code) — Anthropic's official CLI tool for Claude.

**GitHub Repository**: https://github.com/yeluo45/claude-code-design

## Project Structure

```
claude-code-design/
├── docs-site/                 # VitePress documentation site
│   ├── .vitepress/
│   │   ├── config.mjs         # VitePress configuration
│   │   ├── theme/             # Custom theme
│   │   └── public/            # Static assets
│   ├── index.md               # Home page
│   ├── architecture.md         # Architecture overview
│   ├── entry-bootstrap.md     # Entry & Bootstrap
│   ├── core-loop.md           # Core Loop (QueryEngine + query)
│   ├── tool-system.md         # Tool System (59 tools)
│   ├── state-management.md    # State Management
│   ├── mcp-integration.md    # MCP Integration
│   ├── bridge-mode.md         # Bridge Mode + ACP
│   ├── api-providers.md       # API Providers (7 types)
│   ├── feature-flags.md       # Feature Flags (19 flags)
│   ├── budget-mode.md         # Budget Mode
│   └── code-structure.md      # Code Structure
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Pages deployment
└── package.json
```

## Quick Start

```bash
cd docs-site
pnpm install
pnpm run dev      # Development preview
pnpm run build    # Production build
pnpm run preview  # Preview build
```

## Live Site

https://yeluo45.github.io/claude-code-design/

## Content

| Document | Description |
|----------|-------------|
| [Architecture](https://yeluo45.github.io/claude-code-design/architecture) | Core architecture overview |
| [Entry & Bootstrap](https://yeluo45.github.io/claude-code-design/entry-bootstrap) | Startup flow |
| [Core Loop](https://yeluo45.github.io/claude-code-design/core-loop) | QueryEngine + query |
| [Tool System](https://yeluo45.github.io/claude-code-design/tool-system) | 59 built-in tools |
| [State Management](https://yeluo45.github.io/claude-code-design/state-management) | Zustand + React Context |
| [MCP Integration](https://yeluo45.github.io/claude-code-design/mcp-integration) | MCP Server/Client |
| [Bridge Mode](https://yeluo45.github.io/claude-code-design/bridge-mode) | Remote Control + ACP |
| [API Providers](https://yeluo45.github.io/claude-code-design/api-providers) | 7 API providers |
| [Feature Flags](https://yeluo45.github.io/claude-code-design/feature-flags) | 19 feature flags |
| [Budget Mode](https://yeluo45.github.io/claude-code-design/budget-mode) | Budget mode |
| [Code Structure](https://yeluo45.github.io/claude-code-design/code-structure) | Complete directory structure |

## Key Features

| Feature | Description |
|---------|-------------|
| ⚡ Core Loop | QueryEngine + query 函数实现流式 API |
| 🔧 Tool System | 59 个内置工具 + MCP 工具 |
| 🔌 MCP Integration | 内置 MCP Server/Client |
| 🌉 Bridge Mode | Remote Control Server + ACP 协议 |
| 🔀 Multi-Provider | 支持 7 种 API Provider |
| 🚀 Feature Flags | 19 个 Feature Flags |
| 💰 Budget Mode | 节省 50% token |

## Architecture Highlights

| Aspect | Technology |
|--------|------------|
| Runtime | Bun (非 Node.js) |
| Language | TypeScript (strict mode) |
| UI | React + Ink (终端) |
| State | Zustand |
| CLI | Commander.js |
| Build | Bun.build |
| Test | bun:test |
| Lint | Biome |

## Source

Based on [HKUDS/claude-code](https://github.com/HKUDS/claude-code) — reverse-engineered Anthropic Claude Code CLI.
