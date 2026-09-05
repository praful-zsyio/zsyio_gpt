import OpenAI from 'openai';
export class XAIAdapter {
    name = 'xai';
    client = null;
    constructor(apiKey) {
        if (apiKey) {
            this.client = new OpenAI({
                apiKey,
                baseURL: 'https://api.x.ai/v1',
            });
        }
    }
    ensureClient() {
        if (!this.client) {
            throw new Error('xAI API Key is not configured on the server. Please add XAI_API_KEY to server/.env');
        }
        return this.client;
    }
    async sendMessage(messages, model = 'grok-2-latest', options) {
        const client = this.ensureClient();
        const startTime = Date.now();
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
            model,
            messages: formattedMessages,
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens,
        });
        const latencyMs = Date.now() - startTime;
        const choice = response.choices[0];
        return {
            content: choice.message.content || '',
            inputTokens: response.usage?.prompt_tokens || 0,
            outputTokens: response.usage?.completion_tokens || 0,
            model,
            provider: 'xai',
            latencyMs,
        };
    }
    async *streamMessage(messages, model = 'grok-2-latest', options) {
        const client = this.ensureClient();
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
            model,
            messages: formattedMessages,
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens,
            stream: true,
            stream_options: { include_usage: true },
        });
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
                    outputTokens: usage?.completion_tokens,
                };
            }
        }
    }
}
