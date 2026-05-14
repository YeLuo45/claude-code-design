import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Claude Code Design",
  description: "Claude Code CLI 逆向工程设计文档 — Reverse-engineered Anthropic Claude Code",

  head: [
    ["link", { rel: "icon", href: "/favicon.svg" }],
    ["meta", { name: "theme-color", content: "#7c3aed" }],
    ["meta", { property: "og:title", content: "Claude Code Design" }],
    ["meta", { property: "og:description", content: "Claude Code CLI reverse-engineered design documentation" }],
  ],

  base: "/claude-code-design/",

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Architecture", link: "/architecture" },
      { text: "Tool System", link: "/tool-system" },
      { text: "MCP Integration", link: "/mcp-integration" },
      { text: "Bridge Mode", link: "/bridge-mode" },
      { text: "API Providers", link: "/api-providers" },
      { text: "Source", link: "https://github.com/HKUDS/claude-code" },
    ],
    sidebar: [
      { text: "Overview", items: [
        { text: "Introduction", link: "/" },
        { text: "Architecture", link: "/architecture" },
        { text: "Entry & Bootstrap", link: "/entry-bootstrap" },
      ]},
      { text: "Core Components", items: [
        { text: "Core Loop", link: "/core-loop" },
        { text: "Tool System", link: "/tool-system" },
        { text: "State Management", link: "/state-management" },
      ]},
      { text: "Integrations", items: [
        { text: "MCP Integration", link: "/mcp-integration" },
        { text: "Bridge Mode", link: "/bridge-mode" },
        { text: "API Providers", link: "/api-providers" },
      ]},
      { text: "Advanced", items: [
        { text: "Feature Flags", link: "/feature-flags" },
        { text: "Budget Mode", link: "/budget-mode" },
        { text: "Code Structure", link: "/code-structure" },
      ]},
    ],
  },
});
