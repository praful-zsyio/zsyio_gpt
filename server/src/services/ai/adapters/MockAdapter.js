export class MockAdapter {
    name;
    chatMessageClass;
    constructor(providerName = 'mock') {
        this.name = providerName;
        this.chatMessageClass = 'animate-fade-in';
    }
    generateMockReply(messages, model) {
        const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || 'Hello';
        return `Here is a simple response from ${model} (${this.name.toUpperCase()}):\n\n${lastUserMessage}`;
    }
    async sendMessage(messages, model, options) {
        const startTime = Date.now();
        const reply = this.generateMockReply(messages, model);
        const words = reply.split(/\s+/).length;
        return {
            content: reply,
            inputTokens: Math.max(15, messages.reduce((acc, m) => acc + m.content.length / 4, 0)),
            outputTokens: words * 2,
            model,
            provider: this.name,
            latencyMs: Date.now() - startTime,
        };
    }
    async *streamMessage(messages, model, options) {
        const reply = this.generateMockReply(messages, model);
        const chunks = reply.split(/(?<=\n| )/);
        for (let i = 0; i < chunks.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 25));
            yield { delta: chunks[i], done: false };
        }
        yield {
            delta: '',
            done: true,
            inputTokens: Math.floor(messages.reduce((acc, m) => acc + m.content.length / 4, 0)),
            outputTokens: chunks.length,
        };
    }
}
