import { config } from '../../config/env.js';
import { OpenAIAdapter } from './adapters/OpenAIAdapter.js';
import { AnthropicAdapter } from './adapters/AnthropicAdapter.js';
import { GeminiAdapter } from './adapters/GeminiAdapter.js';
import { XAIAdapter } from './adapters/XAIAdapter.js';
import { MockAdapter } from './adapters/MockAdapter.js';
class AIService {
    adapters = new Map();
    constructor() {
        this.initAdapters();
    }
    initAdapters() {
        // OpenAI
        if (config.ai.openaiApiKey) {
            this.adapters.set('openai', new OpenAIAdapter(config.ai.openaiApiKey, config.ai.openaiBaseUrl));
        }
        else {
            this.adapters.set('openai', new MockAdapter('openai'));
        }
        // OpenRouter
        if (config.ai.openrouterApiKey) {
            this.adapters.set('openrouter', new OpenAIAdapter(config.ai.openrouterApiKey, 'https://openrouter.ai/api/v1'));
        }
        // Anthropic
        if (config.ai.anthropicApiKey) {
            this.adapters.set('anthropic', new AnthropicAdapter(config.ai.anthropicApiKey));
        }
        else {
            this.adapters.set('anthropic', new MockAdapter('anthropic'));
        }
        // Gemini
        if (config.ai.googleAiApiKey) {
            this.adapters.set('gemini', new GeminiAdapter(config.ai.googleAiApiKey));
        }
        else {
            this.adapters.set('gemini', new MockAdapter('gemini'));
        }
        // xAI
        if (config.ai.xaiApiKey) {
            this.adapters.set('xai', new XAIAdapter(config.ai.xaiApiKey));
        }
        else {
            this.adapters.set('xai', new MockAdapter('xai'));
        }
    }
    getAdapter(providerName) {
        const adapter = this.adapters.get(providerName.toLowerCase());
        if (!adapter) {
            // Fallback to mock adapter for unknown/unconfigured provider
            return new MockAdapter(providerName);
        }
        return adapter;
    }
    async sendMessage(provider, model, messages, options) {
        const adapter = this.getAdapter(provider);
        try {
            return await adapter.sendMessage(messages, model, options);
        }
        catch (err) {
            const hasOpenRouter = this.adapters.has('openrouter');
            if (hasOpenRouter && (provider === 'openai' || provider === 'anthropic' || provider === 'gemini')) {
                console.warn(`[AIService] ${provider} call failed (${err.message}). Seamlessly failing over to OpenRouter...`);
                const orAdapter = this.adapters.get('openrouter');
                return await orAdapter.sendMessage(messages, model, options);
            }
            throw err;
        }
    }
    async *streamMessage(provider, model, messages, options) {
        const adapter = this.getAdapter(provider);
        try {
            yield* adapter.streamMessage(messages, model, options);
        }
        catch (err) {
            const hasOpenRouter = this.adapters.has('openrouter');
            if (hasOpenRouter && (provider === 'openai' || provider === 'anthropic' || provider === 'gemini')) {
                console.warn(`[AIService] ${provider} stream failed (${err.message}). Seamlessly failing over to OpenRouter...`);
                const orAdapter = this.adapters.get('openrouter');
                yield* orAdapter.streamMessage(messages, model, options);
                return;
            }
            throw err;
        }
    }
    calculateCost(modelId, inputTokens, outputTokens) {
        // Default estimated rates
        let inputRate = 0.002;
        let outputRate = 0.008;
        if (modelId.includes('mini') || modelId.includes('flash') || modelId.includes('haiku')) {
            inputRate = 0.0002;
            outputRate = 0.0006;
        }
        else if (modelId.includes('sonnet') || modelId.includes('gpt-4o') || modelId.includes('grok')) {
            inputRate = 0.003;
            outputRate = 0.012;
        }
        const estimatedCost = (inputTokens / 1000) * inputRate + (outputTokens / 1000) * outputRate;
        const credits = Math.max(1, Math.ceil(estimatedCost * 1000));
        return { estimatedCost, credits };
    }
}
export const aiService = new AIService();
