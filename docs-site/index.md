---
layout: home

hero:
  name: "Claude Code Design"
  text: "逆向工程设计文档"
  tagline: "基于 HKUDS/claude-code 的逆向工程 Claude Code CLI 设计文档站"
  image:
    src: /banner.png
    alt: Claude Code Architecture
  actions:
    - theme: brand
      text: 架构分析 →
      link: /architecture
    - theme: brand
      text: 工具系统 →
      link: /tool-system
    - theme: alt
      text: GitHub →
      link: https://github.com/HKUDS/claude-code

features:
  - icon: ⚡
    title: Core Loop
    details: QueryEngine + query 函数实现流式 API 调用和工具调用循环
    link: /core-loop
  - icon: 🔧
    title: 工具系统
    details: 59 个内置工具 — 文件操作、Shell、Agent 系统、Web/MCP、调度
    link: /tool-system
  - icon: 🔌
    title: MCP 集成
    details: 内置 MCP Server/Client，支持 Claude Code Chrome 扩展
    link: /mcp-integration
  - icon: 🌉
    title: Bridge Mode
    details: Remote Control Server + ACP 协议，支持自托管和 Docker 部署
    link: /bridge-mode
  - icon: 🔀
    title: 多 API Provider
    details: 支持 Anthropic/Bedrock/Vertex/OpenAI/Gemini/Grok 7 种 Provider
    link: /api-providers
  - icon: 🚀
    title: Feature Flags
    details: 19 个 Feature Flags 控制功能开关，灵活定制化构建
    link: /feature-flags
---
