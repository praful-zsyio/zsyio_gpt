# ZsyioGPT - Unified AI & Media Workspace

> **MERN + TypeScript + Multi-Provider AI Gateway (OpenAI, Anthropic Claude, Google Gemini, xAI Grok)**

ZsyioGPT is a unified AI web application where users can access leading AI foundation models from one account and workspace with real-time SSE streaming, token & credit tracking, structured CO-STAR prompt templates, and conversation persistence.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** v18+ (Tested on v24)
- **MongoDB** (Local or MongoDB Atlas)

### 2. Installation
From the root directory:
```bash
npm run install:all
```
*(Or install dependencies in `server/` and `client/` individually)*

### 3. Environment Setup
Configure your API keys and database in `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/zsyiogpt
JWT_SECRET=zsyiogpt_super_secret_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=zsyiogpt_super_secret_refresh_key_2026_secure
JWT_REFRESH_EXPIRES_IN=30d

# Provider Keys (Optional: Simulation mode activates if left blank)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
XAI_API_KEY=
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

### 3. Prompt Engineering (CO-STAR Architect)
Built-in prompt architect based on the **CO-STAR** framework:
- **C** - Context
- **O** - Objective
- **S** - Style
- **T** - Tone
- **A** - Audience
- **R** - Requirements

### 4. Token & Credit Analytics
- Dynamic token counting and cost calculations.
- User credit deduction and generation latency tracking.
- Visual breakdown of consumption by model and provider.

---

## 📁 Repository Structure
```
zsyiogpt/
├── client/                     # React + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/         # ModelSelector, MessageBubble, Composer, Modals
│   │   ├── pages/              # ChatPage, LoginPage, RegisterPage
│   │   ├── services/           # Axios API client
│   │   ├── stores/             # Zustand (useAuthStore, useChatStore)
│   │   └── types/              # Client TypeScript models
├── server/                     # Node.js + Express + TypeScript + Mongoose
│   ├── src/
│   │   ├── config/             # DB & Environment config
│   │   ├── controllers/        # Auth, Models, Conversations, Messages, Prompts, Usage
│   │   ├── middleware/         # JWT Auth, Zod Validation, Error Handler
│   │   ├── models/             # User, AIModel, Conversation, Message, Prompt, Usage, Project
│   │   ├── routes/             # Express API v1 routes
│   │   └── services/ai/        # AI Gateway & Provider Adapters
└── package.json                # Workspace orchestration scripts
```
