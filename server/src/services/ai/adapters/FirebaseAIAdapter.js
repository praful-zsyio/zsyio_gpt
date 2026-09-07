import { getAI, getGenerativeModel, GoogleAIBackend, AgentPlatformBackend } from 'firebase/ai';
import { getFirebaseApp } from '../../../config/firebase.js';

export class FirebaseAIAdapter {
    name = 'firebase-ai';
    aiInstances = new Map();

    getAI(backendType = 'google') {
        const app = getFirebaseApp();
        if (!app) {
            throw new Error('Firebase App is not initialized. Please verify FIREBASE_API_KEY in server/.env');
        }
        const key = (backendType || 'google').toLowerCase();
        if (!this.aiInstances.has(key)) {
            const backend = key === 'agent' || key === 'agentplatform' || key === 'vertex'
                ? new AgentPlatformBackend()
                : new GoogleAIBackend();
            const ai = getAI(app, { backend });
            this.aiInstances.set(key, ai);
        }
        return this.aiInstances.get(key);
    }

    normalizeModel(model) {
        if (!model) return 'gemini-3.7-flash';
        const m = model.toLowerCase();
        if (m.includes('3.7')) return 'gemini-3.7-flash';
        if (m.includes('3.1')) return 'gemini-3.1-flash';
        if (m.includes('2.5')) return 'gemini-2.5-flash';
        if (m.includes('2.0') || m.includes('flash')) return 'gemini-2.0-flash';
        if (m.includes('pro')) return 'gemini-1.5-pro';
        return model;
    }

    async sendMessage(messages, model = 'gemini-3.7-flash', options) {
        const startTime = Date.now();
        const effectiveModel = this.normalizeModel(model);
        const ai = this.getAI(options?.backend);

        const generativeModel = getGenerativeModel(ai, {
            model: effectiveModel,
            systemInstruction: options?.systemPrompt,
            generationConfig: {
                temperature: options?.temperature ?? 0.7,
                maxOutputTokens: options?.maxTokens,
            },
        });

        const history = messages.slice(0, -1).map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));

        const lastMsg = messages[messages.length - 1]?.content || 'Hello';
        const chat = generativeModel.startChat({ history });
        const result = await chat.sendMessage(lastMsg);
        const response = result.response;
        const latencyMs = Date.now() - startTime;
        const content = response.text() || '';
        const usage = response.usageMetadata;

        return {
            content,
            inputTokens: usage?.promptTokenCount || 0,
            outputTokens: usage?.candidatesTokenCount || 0,
            model: effectiveModel,
            provider: 'firebase-ai',
            latencyMs,
        };
    }

    async *streamMessage(messages, model = 'gemini-3.7-flash', options) {
        const effectiveModel = this.normalizeModel(model);
        const ai = this.getAI(options?.backend);

        const generativeModel = getGenerativeModel(ai, {
            model: effectiveModel,
            systemInstruction: options?.systemPrompt,
            generationConfig: {
                temperature: options?.temperature ?? 0.7,
                maxOutputTokens: options?.maxTokens,
            },
        });

        const history = messages.slice(0, -1).map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));

        const lastMsg = messages[messages.length - 1]?.content || 'Hello';
        const chat = generativeModel.startChat({ history });
        const resultStream = await chat.sendMessageStream(lastMsg);

        let inputTokens = 0;
        let outputTokens = 0;

        for await (const chunk of resultStream.stream) {
            const text = chunk.text();
            if (chunk.usageMetadata) {
                inputTokens = chunk.usageMetadata.promptTokenCount || inputTokens;
                outputTokens = chunk.usageMetadata.candidatesTokenCount || outputTokens;
            }
            if (text) {
                yield { delta: text, done: false };
            }
        }

        yield {
            delta: '',
            done: true,
            inputTokens,
            outputTokens,
        };
    }

    async generateContent(prompt, model = 'gemini-3.7-flash', options) {
        const effectiveModel = this.normalizeModel(model);
        const ai = this.getAI(options?.backend);
        const generativeModel = getGenerativeModel(ai, { model: effectiveModel });
        const result = await generativeModel.generateContent(prompt);
        const response = result.response;
        return {
            text: response.text(),
            model: effectiveModel,
            provider: 'firebase-ai',
        };
    }
}
