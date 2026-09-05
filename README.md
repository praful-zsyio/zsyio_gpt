# ZsyioGPT - Unified AI & Media Workspace

> **MERN + Multi-Provider AI Gateway (OpenAI, Anthropic Claude, Google Gemini, xAI Grok, Stability AI)**

ZsyioGPT is a unified AI web application where users can access leading AI foundation models from one account and workspace with real-time SSE streaming, token & credit tracking, structured CO-STAR prompt templates, and conversation persistence.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** v18+ (Tested on v24)
- **Database** (SQLite / MongoDB fallback)

### 2. Installation
From the root directory:
```bash
npm install
```

### 3. Environment Setup
Configure your API keys and database in `server/.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
SQLITE_DB_PATH=./data/database.sqlite
JWT_SECRET=zsyiogpt_super_secret_jwt_key_2026_secure

# Provider Keys
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
STABILITY_API_KEY=
```

### 4. Running Locally
Start both backend API and frontend Vite server concurrently:
```bash
npm run dev
```
- **Frontend Workspace:** [http://localhost:5173](http://localhost:5173)
- **Backend API Gateway:** [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 🏗 Architecture & Core Features

### 1. AI Gateway Architecture
All frontend requests route exclusively through the backend AI Orchestration Layer:
```
React Client ─(SSE Stream)─> Express API ──> AIService ──> Provider Adapter ──> AI Cloud API
                                                                ├── OpenAIAdapter
                                                                ├── AnthropicAdapter
                                                                ├── GeminiAdapter
                                                                └── XAIAdapter
```

### 2. Multi-Provider Models Supported
- **OpenAI:** GPT-4o, GPT-4o Mini
- **Anthropic:** Claude 3.7 Sonnet (Thinking), Claude 3.5 Haiku
- **Google:** Gemini 2.0 Flash, Gemini 1.5 Pro
- **xAI:** Grok 2
- **Stability AI:** SDXL Image Generation

---

## 📁 Repository Structure
```
zsyiogpt/
├── client/                     # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/         # 3D, Layout, UI
│   │   ├── pages/              # ChatPage, ImageGenPage, VideoGenPage, PdfStudioPage, AuthPage
│   │   └── services/           # api.js, firebase.js
├── server/                     # Node.js + Express
│   ├── src/
│   │   ├── config/             # DB & Environment config
│   │   ├── controllers/        # Auth, Models, Conversations, Messages, Prompts, Usage
│   │   ├── middleware/         # JWT Auth, Error Handler
│   │   └── services/           # AI Gateway & Storage
└── package.json                # Workspaces & orchestration scripts
```
