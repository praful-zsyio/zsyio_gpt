const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '') + '/api/v1';

export const getToken = () => localStorage.getItem('zsyiogpt_token');
export const setToken = (token) => localStorage.setItem('zsyiogpt_token', token);
export const removeToken = () => localStorage.removeItem('zsyiogpt_token');

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
    }
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.data = data;
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    register: (name, email, password) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    syncFirebase: (firebaseUserData) =>
      request('/auth/firebase', {
        method: 'POST',
        body: JSON.stringify(firebaseUserData),
      }),
    getMe: () => request('/auth/me'),
    getGuestSession: () => request('/auth/guest', { method: 'POST' }),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },


  // Models
  models: {
    list: () => request('/models'),
  },

  // Conversations
  conversations: {
    list: () => request('/conversations'),
    create: (title, model, systemPrompt) =>
      request('/conversations', {
        method: 'POST',
        body: JSON.stringify({ title, model, systemPrompt }),
      }),
    get: (id) => request(`/conversations/${id}`),
    delete: (id) => request(`/conversations/${id}`, { method: 'DELETE' }),
  },

  // Messages with SSE Streaming
  messages: {
    async stream({ conversationId, content, model, systemPrompt, attachments = [], onChunk, onDone, onError }) {
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE}/messages/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            conversationId,
            content,
            model,
            systemPrompt,
            attachments,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || 'Stream failed to start');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;
            const jsonStr = trimmed.slice(5).trim();
            if (jsonStr === '[DONE]') {
              if (onDone) onDone();
              return;
            }
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.error) {
                if (onError) onError(parsed.error);
              } else {
                if (onChunk) onChunk(parsed);
              }
            } catch (e) {
              // ignore parse errors on fragmented chunks
            }
          }
        }
        if (onDone) onDone();
      } catch (err) {
        if (onError) onError(err.message || 'Streaming failed');
      }
    },
  },

  // Media (Images, Video, TTS)
  media: {
    generateImage: (params) =>
      request('/media/image', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    generateVideo: (params) =>
      request('/media/video', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    generateTTS: (params) =>
      request('/media/audio/tts', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    getHistory: () => request('/media/history'),
  },

  // Files & PDF Extraction
  files: {
    upload: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return request('/files/upload', {
        method: 'POST',
        body: formData,
      });
    },
    list: () => request('/files'),
    delete: (id) => request(`/files/${id}`, { method: 'DELETE' }),
    analyzeReference: (fileId, prompt) =>
      request('/files/reference-analysis', {
        method: 'POST',
        body: JSON.stringify({ fileId, prompt, customPrompt: prompt }),
      }),
  },


  // Prompts (CO-STAR templates)
  prompts: {
    list: () => request('/prompts'),
    create: (promptData) =>
      request('/prompts', {
        method: 'POST',
        body: JSON.stringify(promptData),
      }),
    delete: (id) => request(`/prompts/${id}`, { method: 'DELETE' }),
  },

  // Analytics & Usage
  usage: {
    getStats: () => request('/usage'),
  },

  // Payment Gateway & Credits
  payment: {
    getPlans: () => request('/payment/plans'),
    createOrder: (planId, gateway = 'unified') =>
      request('/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({ planId, gateway }),
      }),
    verifyPayment: (orderId, paymentId) =>
      request('/payment/verify', {
        method: 'POST',
        body: JSON.stringify({ orderId, paymentId }),
      }),
    getHistory: () => request('/payment/history'),
  },
};
