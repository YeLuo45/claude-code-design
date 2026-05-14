# API Providers

> 支持 7 种 API Provider：Anthropic/Bedrock/Vertex/Foundry/OpenAI/Gemini/Grok

## 1. Provider Architecture

```
┌─────────────────────────────────────────────────────────┐
│ API Layer                                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ src/services/api/                                    │ │
│  │                                                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │ │
│  │  │claude.ts │  │openai/  │  │gemini/   │        │ │
│  │  │(core)    │  │(adapter) │  │(adapter) │        │ │
│  │  └──────────┘  └──────────┘  └──────────┘        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │ │
│  │  │bedrock/  │  │foundry/  │  │grok/     │        │ │
│  │  │(adapter) │  │(adapter) │  │(adapter) │        │ │
│  │  └──────────┘  └──────────┘  └──────────┘        │ │
│  └─────────────────────────────────────────────────────┘ │
│                            │                            │
│                            ▼                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 流适配器模式                                         │ │
│  │ Third-party format → Anthropic internal format      │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 2. Provider Selection

```typescript
// src/utils/model/providers.ts

type Provider =
  | 'firstParty'   // Anthropic Direct
  | 'bedrock'      // AWS Bedrock
  | 'vertex'       // Google Cloud Vertex
  | 'foundry'      // Microsoft Foundry
  | 'openai'       // OpenAI Compatible
  | 'gemini'       // Google Gemini
  | 'grok';        // xAI Grok

// 优先级: modelType 参数 > 环境变量 > 默认 firstParty
function selectProvider(params: {
  modelType?: string;
  envOverride?: string;
}): Provider {
  if (params.modelType) {
    return mapModelTypeToProvider(params.modelType);
  }
  if (params.envOverride) {
    return resolveEnvOverride(params.envOverride);
  }
  return 'firstParty';
}
```

## 3. firstParty (Anthropic Direct)

默认 provider，直接调用 Anthropic API：

```typescript
// src/services/api/claude.ts
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await anthropic.messages.stream({
  model: 'claude-opus-4-5',
  messages: [...],
  tools: [...],
  system: systemPrompt,
});
```

## 4. OpenAI Compatible

通过 `CLAUDE_CODE_USE_OPENAI=1` 启用：

```typescript
// src/services/api/openai/

// 支持 Ollama/DeepSeek/vLLM 等
interface OpenAIConfig {
  apiKey: string;
  baseUrl: string;      // e.g., http://localhost:11434/v1
  model: string;        // e.g., llama3
}
```

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `CLAUDE_CODE_USE_OPENAI` | Yes | 启用 OpenAI 兼容层 |
| `OPENAI_API_KEY` | Yes | API key |
| `OPENAI_BASE_URL` | No | 自定义端点 |
| `OPENAI_MODEL` | No | 模型名称 |

### DeepSeek Support
支持 DeepSeek thinking mode：

```typescript
// 自动检测 DeepSeek 模型并启用 thinking
if (model.includes('deepseek')) {
  params.max_tokens = 8192;
  params.thinking = { type: 'enabled', budget_tokens: 8192 };
}
```

## 5. Gemini Compatible

通过 `CLAUDE_CODE_USE_GEMINI=1` 启用：

```typescript
// src/services/api/gemini/

interface GeminiConfig {
  apiKey: string;
  model: string;        // 直接指定，如 'gemini-2.5-flash'
}
```

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `CLAUDE_CODE_USE_GEMINI` | Yes | 启用 Gemini 兼容层 |
| `GEMINI_API_KEY` | Yes | API key |
| `GEMINI_MODEL` | No | 直接指定模型 |
| `GEMINI_DEFAULT_SONNET_MODEL` | No | Sonnet 能力映射 |
| `GEMINI_DEFAULT_OPUS_MODEL` | No | Opus 能力映射 |

### Model Mapping
```
GEMINI_MODEL > GEMINI_DEFAULT_*_MODEL > 原样返回
```

## 6. Grok Compatible

通过 `CLAUDE_CODE_USE_GROK=1` 启用：

```typescript
// src/services/api/grok/

interface GrokConfig {
  apiKey: string;
  model: string;        // e.g., 'grok-2'
}
```

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `CLAUDE_CODE_USE_GROK` | Yes | 启用 Grok 兼容层 |
| `GROK_API_KEY` | Yes | API key |
| `GROK_MODEL` | No | 模型名称 |

## 7. Bedrock (AWS)

AWS Bedrock provider：

```typescript
// src/services/api/bedrock/

interface BedrockConfig {
  region: string;           // e.g., 'us-east-1'
  accessKeyId?: string;
  secretAccessKey?: string;
  // 或使用 AWS_PROFILE / IAM Role
}
```

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `AWS_REGION` | Yes | AWS 区域 |
| `AWS_ACCESS_KEY_ID` | No | Access key |
| `AWS_SECRET_ACCESS_KEY` | No | Secret key |

## 8. Vertex (Google Cloud)

Google Cloud Vertex provider：

```typescript
// src/services/api/vertex/

interface VertexConfig {
  projectId: string;
  region: string;           // e.g., 'us-central1'
  credentials?: string;     // Path to service account JSON
}
```

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `VERTEX_PROJECT_ID` | Yes | GCP 项目 ID |
| `GOOGLE_CLOUD_REGION` | No | 区域 |
| `GOOGLE_APPLICATION_CREDENTIALS` | No | 服务账号 JSON |

## 9. Foundry (Microsoft)

Microsoft Foundry provider：

```typescript
// src/services/api/foundry/

interface FoundryConfig {
  endpoint: string;          // Foundry URL
  apiKey?: string;          // API key or OAuth token
}
```

## 10. Stream Adapter Pattern

所有兼容层采用流适配器模式：

```typescript
// 将第三方 API 格式转为 Anthropic 内部格式
async function* streamAdapter(
  thirdPartyStream: AsyncIterable<ThirdPartyEvent>
): AsyncIterable<AnthropicEvent> {
  for await (const event of thirdPartyStream) {
    yield convertToAnthropicFormat(event);
  }
}

// 下游代码完全不改
for await (const event of streamAdapter(openAIStream)) {
  // 处理事件
  // 与原生 Anthropic 事件格式相同
}
```

## 11. Provider Comparison

| Provider | Auth | Models | Special |
|----------|------|--------|---------|
| firstParty | ANTHROPIC_API_KEY | Claude 全系列 | 默认 |
| OpenAI | OPENAI_API_KEY | Llama3/Mixtral 等 | Ollama/DeepSeek/vLLM |
| Gemini | GEMINI_API_KEY | Gemini 全系列 | Google 生態 |
| Grok | GROK_API_KEY | Grok 全系列 | xAI |
| Bedrock | AWS IAM | Claude via Bedrock | AWS 生态 |
| Vertex | GCP IAM | Claude via Vertex | Google Cloud |
| Foundry | OAuth/API Key | 自定义 | Microsoft 生态 |

## 12. Configuration Example

```json
// ~/.config/claude-code/settings.json
{
  "provider": "firstParty",
  "model": "claude-opus-4-5",
  "apiKeyEnvVar": "ANTHROPIC_API_KEY"
}
```
