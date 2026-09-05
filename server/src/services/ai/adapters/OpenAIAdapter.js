import OpenAI from 'openai';
export class OpenAIAdapter {
    name = 'openai';
    client = null;
    isOpenRouter = false;
    constructor(apiKey, customBaseUrl) {
        if (apiKey) {
            const trimmedKey = apiKey.trim();
            this.isOpenRouter = trimmedKey.startsWith('sk-or-');
            const baseURL = customBaseUrl || (this.isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined);
            this.client = new OpenAI({
                apiKey: trimmedKey,
                baseURL,
                defaultHeaders: this.isOpenRouter
                    ? {
                        'HTTP-Referer': 'https://zsyiogpt.com',
                        'X-Title': 'ZsyioGPT Unified Workspace',
                    }
                    : undefined,
            });
        }
    }
    ensureClient() {
        if (!this.client) {
            throw new Error('OpenAI API Key is not configured on the server. Please add OPENAI_API_KEY to server/.env');
        }
        return this.client;
    }
    resolveModel(model) {
        if (this.isOpenRouter) {
            if (model.includes('claude')) {
                return 'anthropic/claude-3-haiku';
            }
            if (model.includes('gemini')) {
                return 'google/gemini-2.5-flash';
            }
            if (!model.includes('/')) {
                if (model.startsWith('gpt-') || model.startsWith('o1') || model.startsWith('o3')) {
                    return `openai/${model}`;
                }
                if (model.startsWith('grok-')) {
                    return `x-ai/${model}`;
                }
            }
        }
        return model;
    }
    async sendMessage(messages, model = 'gpt-4o', options) {
        const client = this.ensureClient();
        const startTime = Date.now();
        const effectiveModel = this.resolveModel(model);
        const formattedMessages = [];
        if (options?.systemPrompt) {
            formattedMessages.push({ role: 'system', content: options.systemPrompt });
        }
        for (const msg of messages) {
            formattedMessages.push({
                role: msg.role === 'system' ? 'system' : msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content,
            });
        }
        const response = await client.chat.completions.create({
            model: effectiveModel,
            messages: formattedMessages,
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens || (this.isOpenRouter ? 2048 : undefined),
        });
        const latencyMs = Date.now() - startTime;
        const choice = response.choices[0];
        return {
            content: choice.message.content || '',
            inputTokens: response.usage?.prompt_tokens || 0,
            outputTokens: response.usage?.completion_tokens || 0,
            model,
            provider: 'openai',
            latencyMs,
        };
    }
    async *streamMessage(messages, model = 'gpt-4o', options) {
        const client = this.ensureClient();
        const effectiveModel = this.resolveModel(model);
        const formattedMessages = [];
        if (options?.systemPrompt) {
            formattedMessages.push({ role: 'system', content: options.systemPrompt });
        }
        for (const msg of messages) {
            formattedMessages.push({
                role: msg.role === 'system' ? 'system' : msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content,
            });
        }
        const stream = await client.chat.completions.create({
            model: effectiveModel,
            messages: formattedMessages,
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens || (this.isOpenRouter ? 2048 : undefined),
            stream: true,
            stream_options: { include_usage: true },
        });
        let totalOutputTokens = 0;
        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || '';
            const finishReason = chunk.choices[0]?.finish_reason || undefined;
            const usage = chunk.usage;
            if (delta) {
                yield { delta, done: false };
            }
            if (finishReason || usage) {
                yield {
                    delta: '',
                    done: Boolean(finishReason),
                    finishReason: finishReason ?? undefined,
                    inputTokens: usage?.prompt_tokens,
                    outputTokens: usage?.completion_tokens ?? totalOutputTokens,
                };
            }
        }
    }
}
