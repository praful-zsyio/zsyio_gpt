import { apiClient } from './client.js';

export async function checkBackendHealth() {
  try {
    const res = await apiClient.get('/health');
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function fetchAIModels() {
  try {
    const res = await apiClient.get('/models');
    if (res.data?.success) {
      return res.data.data.models || [];
    }
    return [];
  } catch (err) {
    console.warn('[API] Could not fetch remote models, using defaults:', err.message);
    return [
      { id: 'gpt-4o', displayName: 'GPT-4o', provider: 'openai', category: 'text' },
      { id: 'claude-3-5-sonnet-20241022', displayName: 'Claude 3.5 Sonnet', provider: 'anthropic', category: 'text' },
      { id: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', provider: 'gemini', category: 'text' },
      { id: 'grok-beta', displayName: 'Grok Beta', provider: 'xai', category: 'text' },
      { id: 'dall-e-3', displayName: 'DALL-E 3', provider: 'openai', category: 'image' },
      { id: 'flux-schnell', displayName: 'Flux Schnell', provider: 'replicate', category: 'image' }
    ];
  }
}

export async function fetchConversations() {
  try {
    const res = await apiClient.get('/conversations');
    return res.data?.data?.conversations || [];
  } catch (err) {
    console.warn('[API] Fetch conversations error:', err.message);
    return [];
  }
}

export async function createNewConversation(title = 'New Neural Chat', model = 'gpt-4o') {
  try {
    const res = await apiClient.post('/conversations', { title, model });
    return res.data?.data?.conversation || null;
  } catch (err) {
    console.warn('[API] Create conversation fallback:', err.message);
    return {
      _id: 'conv_' + Date.now(),
      title,
      model,
      messages: [],
      createdAt: new Date().toISOString(),
    };
  }
}

export async function streamChatMessage({
  conversationId,
  content,
  model = 'gpt-4o',
  onChunk,
  onDone,
  onError,
}) {
  const token = localStorage.getItem('zsyiogpt_token');
  try {
    const response = await fetch('/api/v1/messages/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        conversationId,
        content,
        model,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.replace(/^data:\s*/, '');
        if (dataStr === '[DONE]') {
          if (onDone) onDone();
          return;
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.content && onChunk) {
            onChunk(parsed.content);
          }
          if (parsed.done && onDone) {
            onDone();
          }
        } catch {
          // If plain text chunk
          if (onChunk && dataStr) onChunk(dataStr);
        }
      }
    }

    if (onDone) onDone();
  } catch (err) {
    console.error('[Stream Error]', err);
    if (onError) onError(err);
  }
}

export async function generateMediaImage({ prompt, model = 'dall-e-3', size = '1024x1024', style = 'vivid' }) {
  const res = await apiClient.post('/media/image', {
    prompt,
    model,
    size,
    style,
  });
  return res.data;
}

export async function generateMediaTTS({ text, voice = 'alloy' }) {
  const res = await apiClient.post('/media/audio/tts', {
    text,
    voice,
  });
  return res.data;
}

export async function fetchMediaHistory() {
  try {
    const res = await apiClient.get('/media/history');
    return res.data?.data || [];
  } catch (err) {
    return [];
  }
}

// -------------------------------------------------------------
// File Upload Integration
// -------------------------------------------------------------
export async function uploadWorkspaceFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

// -------------------------------------------------------------
// Payment & Subscription Integration
// -------------------------------------------------------------
export async function fetchPaymentPlans() {
  try {
    const res = await apiClient.get('/payment/plans');
    return res.data?.data || null;
  } catch (err) {
    console.warn('[API] Could not fetch payment plans, using defaults:', err.message);
    return null;
  }
}

export async function createPaymentOrder(orderPayload) {
  const res = await apiClient.post('/payment/create-order', orderPayload);
  return res.data;
}

export async function verifyPaymentOrder(verifyPayload) {
  const res = await apiClient.post('/payment/verify', verifyPayload);
  return res.data;
}

