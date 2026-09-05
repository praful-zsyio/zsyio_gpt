// In-memory fallback database for resilient offline development
class MemoryStore {
    users = new Map();
    conversations = new Map();
    messages = new Map();
    prompts = new Map();
    usages = [];
    files = new Map();
    medias = new Map();
    isMongoAvailable = false;
    constructor() {
        const defaultUserId = 'demo-user-1';
        this.users.set(defaultUserId, {
            _id: defaultUserId,
            name: 'Demo User',
            email: 'demo@zsyiogpt.com',
            passwordHash: '$2a$10$wT8K8U1yJ5E6kM3k5a2K5.0mPqR7sT9uV1wX3yZ5a7b9c1d3e5f7g',
            role: 'user',
            plan: 'free',
            credits: 1000,
            preferences: {
                theme: 'dark',
                defaultModel: 'gpt-4o',
                streamResponse: true,
            },
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
}
export const memoryStore = new MemoryStore();
