import Anthropic from '@anthropic-ai/sdk';
export class AnthropicAdapter {
    name = 'anthropic';
    client = null;
    constructor(apiKey) {
        if (apiKey && apiKey.trim()) {
            this.client = new Anthropic({ apiKey: apiKey.trim() });
        }
    }
    ensureClient() {
        if (!this.client) {
            throw new Error('Anthropic API Key is not configured on the server. Please add ANTHROPIC_API_KEY (or CLAUDE_API_KEY) to server/.env');
        }
        return this.client;
    }
    async sendMessage(messages, model = 'claude-3-7-sonnet-20250219', options) {
        const client = this.ensureClient();
        const startTime = Date.now();
        const formattedMessages = messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
        }));
        const systemPrompt = options?.systemPrompt || messages.find((m) => m.role === 'system')?.content;
        try {
            const response = await client.messages.create({
                model,
                max_tokens: options?.maxTokens ?? 4096,
                system: systemPrompt,
                temperature: options?.temperature ?? 0.7,
                messages: formattedMessages,
            });
            const latencyMs = Date.now() - startTime;
            const textBlock = response.content.find((block) => block.type === 'text');
            const content = textBlock && 'text' in textBlock ? textBlock.text : '';
            return {
                content,
                inputTokens: response.usage.input_tokens || 0,
                outputTokens: response.usage.output_tokens || 0,
                model,
                provider: 'anthropic',
                latencyMs,
            };
        }
        catch (err) {
            if (err?.status === 400 && err?.message?.includes('credit balance is too low')) {
                throw new Error('Anthropic Claude error: Your credit balance is too low to access the Anthropic API. Please add credits at https://console.anthropic.com/settings/billing or select another model.');
            }
            throw err;
        }
    }
    async *streamMessage(messages, model = 'claude-3-7-sonnet-20250219', options) {
        const client = this.ensureClient();
        const formattedMessages = messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
        }));
        const systemPrompt = options?.systemPrompt || messages.find((m) => m.role === 'system')?.content;
        try {
            const stream = client.messages.stream({
                model,
                max_tokens: options?.maxTokens ?? 4096,
                system: systemPrompt,
                temperature: options?.temperature ?? 0.7,
                messages: formattedMessages,
            });
            for await (const event of stream) {
                if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                    yield { delta: event.delta.text, done: false };
                }
            }
            const finalMessage = await stream.finalMessage();
            yield {
                delta: '',
                done: true,
                inputTokens: finalMessage.usage.input_tokens,
                outputTokens: finalMessage.usage.output_tokens,
            };
        }
        catch (err) {
            if (err?.status === 400 && err?.message?.includes('credit balance is too low')) {
                throw new Error('Anthropic Claude error: Your credit balance is too low to access the Anthropic API. Please add credits at https://console.anthropic.com/settings/billing or select another model.');
            }
            throw err;
        }
    }
}
