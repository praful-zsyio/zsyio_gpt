import { Usage } from '../models/Usage.js';
import { User } from '../models/User.js';
import { memoryStore } from '../services/store/memoryStore.js';
export const getUsageStats = async (req, res, next) => {
    try {
        const userId = req.userId || 'demo-user-1';
        if (memoryStore.isMongoAvailable) {
            const user = await User.findById(userId).select('credits plan');
            const recentUsage = await Usage.find({ userId }).sort({ createdAt: -1 }).limit(50);
            const allRecords = await Usage.find({ userId });
            const totalTokens = allRecords.reduce((acc, curr) => acc + (curr.totalTokens || 0), 0);
            const totalRequests = allRecords.length;
            const totalCost = allRecords.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);
            const providerBreakdown = {};
            for (const record of allRecords) {
                providerBreakdown[record.provider] = (providerBreakdown[record.provider] || 0) + (record.totalTokens || 0);
            }
            res.json({
                success: true,
                data: {
                    credits: user?.credits ?? 1000,
                    plan: user?.plan ?? 'free',
                    totalTokens,
                    totalRequests,
                    totalCost,
                    providerBreakdown,
                    recentUsage,
                },
            });
            return;
        }
        // In-memory fallback
        const memUser = memoryStore.users.get(userId) || Array.from(memoryStore.users.values())[0];
        const userRecords = memoryStore.usages.filter((u) => u.userId === userId);
        const totalTokens = userRecords.reduce((acc, curr) => acc + curr.totalTokens, 0);
        const totalRequests = userRecords.length;
        const totalCost = userRecords.reduce((acc, curr) => acc + curr.estimatedCost, 0);
        const providerBreakdown = {};
        for (const record of userRecords) {
            providerBreakdown[record.provider] = (providerBreakdown[record.provider] || 0) + record.totalTokens;
        }
        res.json({
            success: true,
            data: {
                credits: memUser?.credits ?? 1000,
                plan: memUser?.plan ?? 'free',
                totalTokens,
                totalRequests,
                totalCost,
                providerBreakdown,
                recentUsage: userRecords.slice(0, 50),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
