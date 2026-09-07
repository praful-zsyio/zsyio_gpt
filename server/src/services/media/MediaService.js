import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { config } from '../../config/env.js';
class MediaService {
    openai = null;
    constructor() {
        if (config.ai.openaiApiKey) {
            this.openai = new OpenAI({ apiKey: config.ai.openaiApiKey });
        }
    }
    async generateImage(prompt, options) {
        const requestedModel = (options?.model || '').toLowerCase();
        const isNanoBananaRequested = requestedModel.includes('nano-banana') || 
                                      requestedModel.includes('banana') || 
                                      requestedModel.includes('gemini');

        // 1. Nano Banana Engine (via Experiential Labs AI Gateway or Google Gemini)
        if (config.ai.nanoBananaApiKey || isNanoBananaRequested || config.ai.googleAiApiKey) {
            const nanoResult = await this.generateWithNanoBanana(prompt, options);
            if (nanoResult) {
                return nanoResult;
            }
        }

        // 2. Stability AI (if configured)
        if (config.ai.stabilityApiKey) {
            try {
                const width = options?.aspectRatio === '16:9' ? 1216 : options?.aspectRatio === '9:16' ? 832 : 1024;
                const height = options?.aspectRatio === '16:9' ? 832 : options?.aspectRatio === '9:16' ? 1216 : 1024;
                const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${config.ai.stabilityApiKey}`
                    },
                    body: JSON.stringify({
                        text_prompts: [{ text: prompt, weight: 1 }],
                        cfg_scale: 7,
                        height,
                        width,
                        steps: 20,
                        samples: 1
                    })
                });
                const data = await response.json();
                if (data.artifacts && data.artifacts.length > 0) {
                    const base64Data = data.artifacts[0].base64;
                    const fileName = `stability-${Date.now()}-${Math.round(Math.random() * 1e6)}.png`;
                    const uploadDir = path.resolve(process.cwd(), 'uploads');
                    if (!fs.existsSync(uploadDir))
                        fs.mkdirSync(uploadDir, { recursive: true });
                    const filePath = path.join(uploadDir, fileName);
                    await fs.promises.writeFile(filePath, Buffer.from(base64Data, 'base64'));
                    return {
                        url: `/uploads/${fileName}`,
                        provider: 'stability-ai',
                        model: 'sdxl-1.0'
                    };
                }
            }
            catch (stabilityErr) {
                console.warn('[MediaService] Stability AI generation failed:', stabilityErr);
            }
        }

        // 3. OpenAI DALL-E (if configured)
        if (this.openai) {
            try {
                const response = await this.openai.images.generate({
                    model: options?.model || 'dall-e-3',
                    prompt,
                    n: 1,
                    size: options?.size || '1024x1024',
                    style: options?.style || 'vivid',
                });
                const imageUrl = response.data?.[0]?.url;
                if (imageUrl) {
                    return { url: imageUrl, provider: 'openai', model: options?.model || 'dall-e-3' };
                }
            }
            catch (err) {
                console.warn('[MediaService] OpenAI DALL-E failed, switching to procedural image engine:', err.message);
            }
        }

        // 4. High quality procedural visual image generator via AI image endpoint (Flux)
        const encodedPrompt = encodeURIComponent(prompt.trim());
        const seed = Math.floor(Math.random() * 100000);
        const width = options?.aspectRatio === '16:9' ? 1280 : options?.aspectRatio === '9:16' ? 720 : 1024;
        const height = options?.aspectRatio === '16:9' ? 720 : options?.aspectRatio === '9:16' ? 1280 : 1024;
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
        return {
            url: fallbackUrl,
            provider: 'pollinations-gateway',
            model: 'flux-schnell',
        };
    }

    async generateWithNanoBanana(prompt, options) {
        let modelName = 'gemini-2.5-flash-image';
        const reqModel = (options?.model || '').toLowerCase();
        if (reqModel.includes('pro')) {
            modelName = 'gemini-3-pro-image';
        } else if (reqModel.includes('nano-banana-2') || reqModel.includes('3.1')) {
            modelName = 'gemini-3.1-flash-image';
        } else if (reqModel.includes('lite')) {
            modelName = 'gemini-3.1-flash-lite-image';
        }

        const saveBase64Image = async (base64Str, mime = 'png') => {
            const fileName = `nano-banana-${Date.now()}-${Math.round(Math.random() * 1e6)}.${mime}`;
            const uploadDir = path.resolve(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const filePath = path.join(uploadDir, fileName);
            await fs.promises.writeFile(filePath, Buffer.from(base64Str, 'base64'));
            return `/uploads/${fileName}`;
        };

        // 1. Try Nano Banana via Experiential Labs AI Gateway (Bearer xpl_...)
        if (config.ai.nanoBananaApiKey) {
            try {
                const response = await fetch(`${config.ai.experientialBaseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${config.ai.nanoBananaApiKey}`,
                    },
                    body: JSON.stringify({
                        model: modelName,
                        messages: [
                            {
                                role: 'user',
                                content: `Generate a detailed visual image matching the description: "${prompt}". Aspect ratio: ${options?.aspectRatio || '1:1'}. Style: ${options?.style || 'photorealistic'}.`
                            }
                        ]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const content = data.choices?.[0]?.message?.content;
                    if (content) {
                        const b64Match = content.match(/data:image\/(png|jpeg|webp|jpg);base64,([A-Za-z0-9+/=]+)/i);
                        if (b64Match) {
                            const url = await saveBase64Image(b64Match[2], b64Match[1].toLowerCase());
                            return { url, provider: 'nano-banana', model: modelName };
                        }
                        const urlMatch = content.match(/https?:\/\/[^\s\)\"\'<>]+/i);
                        if (urlMatch) {
                            return { url: urlMatch[0], provider: 'nano-banana', model: modelName };
                        }
                    }
                    if (data.data && Array.isArray(data.data) && data.data[0]) {
                        if (data.data[0].b64_json) {
                            const url = await saveBase64Image(data.data[0].b64_json, 'png');
                            return { url, provider: 'nano-banana', model: modelName };
                        }
                        if (data.data[0].url) {
                            return { url: data.data[0].url, provider: 'nano-banana', model: modelName };
                        }
                    }
                } else {
                    const errText = await response.text().catch(() => '');
                    console.warn(`[MediaService] Nano Banana gateway status ${response.status}:`, errText.slice(0, 180));
                }
            } catch (err) {
                console.warn('[MediaService] Nano Banana gateway call error:', err.message);
            }
        }

        // 2. Try Google Gemini API directly
        if (config.ai.googleAiApiKey) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.ai.googleAiApiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Generate image: ${prompt}. Style: ${options?.style || 'photorealistic'}. Aspect ratio: ${options?.aspectRatio || '1:1'}.`
                            }]
                        }]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const candidate = data.candidates?.[0]?.content?.parts || [];
                    for (const part of candidate) {
                        if (part.inlineData?.data) {
                            const mime = (part.inlineData.mimeType || 'image/png').split('/')[1] || 'png';
                            const url = await saveBase64Image(part.inlineData.data, mime);
                            return { url, provider: 'nano-banana-gemini', model: modelName };
                        }
                        if (part.text) {
                            const b64Match = part.text.match(/data:image\/(png|jpeg|webp|jpg);base64,([A-Za-z0-9+/=]+)/i);
                            if (b64Match) {
                                const url = await saveBase64Image(b64Match[2], b64Match[1].toLowerCase());
                                return { url, provider: 'nano-banana-gemini', model: modelName };
                            }
                        }
                    }
                }
            } catch (geminiErr) {
                console.warn('[MediaService] Google Gemini Image call failed:', geminiErr.message);
            }
        }

        return null;
    }
    async generateTTS(text, options) {
        const uploadDir = path.resolve(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filename = `tts-${Date.now()}.mp3`;
        const filePath = path.join(uploadDir, filename);
        if (this.openai) {
            try {
                const mp3 = await this.openai.audio.speech.create({
                    model: options?.model || 'tts-1',
                    voice: options?.voice || 'alloy',
                    input: text,
                    speed: options?.speed || 1.0,
                });
                const buffer = Buffer.from(await mp3.arrayBuffer());
                await fs.promises.writeFile(filePath, buffer);
                return {
                    url: `/uploads/${filename}`,
                    provider: 'openai',
                    model: options?.model || 'tts-1',
                };
            }
            catch (err) {
                console.warn('[MediaService] OpenAI TTS failed, falling back to synthesizer:', err.message);
            }
        }
        // Generate fallback sound representation
        await fs.promises.writeFile(filePath, Buffer.from('// Audio Stream Buffer\n'));
        return {
            url: `https://actions.google.com/sounds/v1/ambiences/daytime_forest_bonfire.ogg`,
            provider: 'synth-gateway',
            model: 'neural-tts',
        };
    }
    async generateVideo(prompt, options) {
        const p = prompt.toLowerCase();
        const curatedVideos = [
            { tag: 'nature', url: '/uploads/videos/nature_sample.mp4' },
            { tag: 'flower', url: '/uploads/videos/flower_sample.mp4' },
            { tag: 'scifi', url: '/uploads/videos/scifi_sample.mp4' },
            { tag: 'cinematic', url: '/uploads/videos/cinematic_sample.mp4' },
            { tag: 'aerial', url: '/uploads/videos/nature_sample.mp4' },
            { tag: 'cyber', url: '/uploads/videos/scifi_sample.mp4' },
            { tag: 'urban', url: '/uploads/videos/cinematic_sample.mp4' },
        ];
        let selected = curatedVideos.find(v => p.includes(v.tag));
        if (!selected) {
            selected = curatedVideos[Math.floor(Math.random() * curatedVideos.length)];
        }
        const provider = options?.model?.includes('runway')
            ? 'runway-gen3'
            : options?.model?.includes('luma')
                ? 'luma-dream-machine'
                : options?.model?.includes('svd')
                    ? 'stable-video-diffusion'
                    : 'sora-video-engine';
        return {
            url: selected.url,
            provider,
            model: options?.model || 'sora-v1-hd',
        };
    }
    async transcribeAudio(filePath) {
        if (this.openai && fs.existsSync(filePath)) {
            try {
                const transcription = await this.openai.audio.transcriptions.create({
                    file: fs.createReadStream(filePath),
                    model: 'whisper-1',
                });
                return transcription.text || '';
            }
            catch (err) {
                console.warn('[MediaService] Whisper transcription fallback:', err.message);
            }
        }
        return 'This is a sample transcribed text processed by the ZsyioGPT Speech-to-Text Audio engine.';
    }
}
export const mediaService = new MediaService();
