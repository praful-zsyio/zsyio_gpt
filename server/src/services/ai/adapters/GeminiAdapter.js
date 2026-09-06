import { GoogleGenerativeAI } from '@google/generative-ai';
export class GeminiAdapter {
    name = 'gemini';
    genAI = null;
    constructor(apiKey) {
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
        }
    }
    ensureClient() {
        if (!this.genAI) {
            throw new Error('Google Gemini API Key is not configured on the server. Please add GOOGLE_AI_API_KEY to server/.env');
        }
        return this.genAI;
    }
    normalizeModel(model) {
        if (model && model.includes('pro')) {
            return 'gemini-1.5-pro';
        }
        if (model && (model.includes('2') || model.includes('flash'))) {
            return 'gemini-2.0-flash';
        }
        return 'gemini-1.5-flash';
    }

    async sendMessage(messages, model = 'gemini-2.0-flash', options) {
        const genAI = this.ensureClient();
        const startTime = Date.now();
        const effectiveModel = this.normalizeModel(model);
        const generativeModel = genAI.getGenerativeModel({
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
            model,
            provider: 'gemini',
            latencyMs,
        };
    }
    async *streamMessage(messages, model = 'gemini-2.0-flash', options) {
        const genAI = this.ensureClient();
        const effectiveModel = this.normalizeModel(model);
        const generativeModel = genAI.getGenerativeModel({
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
}
