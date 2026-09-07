import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { memoryStore } from '../services/store/memoryStore.js';

// In-memory payment ledger fallback
const paymentTransactions = new Map();

export const PLANS = [
    {
        id: 'starter_pack',
        name: 'Starter Credits',
        type: 'credits',
        price: 5,
        currency: 'USD',
        credits: 2500,
        badge: 'Beginner',
        popular: false,
        features: [
            '2,500 High-Speed Inference Credits',
            'Access to Nano Banana & Gemini Image',
            'Full PDF Studio OCR Engine',
            'Standard Processing Queue',
        ],
    },
    {
        id: 'pro_pack',
        name: 'Creator Pack',
        type: 'credits',
        price: 19,
        currency: 'USD',
        credits: 15000,
        badge: 'Most Popular',
        popular: true,
        features: [
            '15,000 Neural AI Credits',
            'Priority Nano Banana 2 & Pro Access',
            'Ultra 4K Video Generation Engine',
            'High-Res Multi-Format Downloads (PNG/PDF)',
            '24/7 Priority Model Routing',
        ],
    },
    {
        id: 'studio_pack',
        name: 'Studio Power Pack',
        type: 'credits',
        price: 49,
        currency: 'USD',
        credits: 50000,
        badge: 'Best Value',
        popular: false,
        features: [
            '50,000 Studio AI Credits',
            'Unlimited Parallel Generations',
            'Custom AI Agents & Coding Workflows',
            'Dedicated Inference Pipeline',
            'Pro Badge & Priority Support',
        ],
    },
    {
        id: 'pro_subscription',
        name: 'ZsyioGPT Pro Monthly',
        type: 'subscription',
        price: 29,
        currency: 'USD',
        billing: 'monthly',
        credits: 30000,
        badge: 'Subscription',
        popular: false,
        features: [
            '30,000 Fresh Credits Replenished Monthly',
            'Automatic Plan Upgrade to PRO',
            'Nano Banana & DALL-E 3 Unlimited Access',
            'Uncapped Chat History & Context',
            'Cancel Anytime With 1-Click',
        ],
    },
];

export const getPlans = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: {
                plans: PLANS,
                gateways: [
                    { id: 'unified', name: 'Instant Card / UPI / NetBanking', supported: true },
                    { id: 'stripe', name: 'Stripe Global Checkout', supported: !!config.payment.stripePublishableKey },
                    { id: 'razorpay', name: 'Razorpay (Cards / UPI / NetBanking)', supported: !!config.payment.razorpayKeyId },
                ],
                config: {
                    stripePublishableKey: config.payment.stripePublishableKey || '',
                    razorpayKeyId: config.payment.razorpayKeyId || '',
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const createOrder = async (req, res, next) => {
    try {
        const userId = req.userId || 'demo-user-1';
        const { planId, gateway = 'unified', currency = 'USD' } = req.body;

        const selectedPlan = PLANS.find(p => p.id === planId);
        if (!selectedPlan) {
            res.status(400).json({ success: false, message: 'Invalid plan or package selected' });
            return;
        }

        const orderId = `order_${gateway}_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
        const orderData = {
            orderId,
            userId,
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            type: selectedPlan.type,
            credits: selectedPlan.credits,
            amount: selectedPlan.price,
            currency: currency || selectedPlan.currency,
            gateway,
            status: 'created',
            createdAt: new Date(),
        };

        paymentTransactions.set(orderId, orderData);

        res.status(201).json({
            success: true,
            message: 'Payment order created successfully',
            data: {
                ...orderData,
                key: gateway === 'razorpay' ? config.payment.razorpayKeyId : config.payment.stripePublishableKey,
            }
        });
    } catch (error) {
        next(error);
    }
};

export const verifyPayment = async (req, res, next) => {
    try {
        const userId = req.userId || 'demo-user-1';
        const { orderId, paymentId = `pay_${Date.now()}` } = req.body;

        const order = paymentTransactions.get(orderId);
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found or expired' });
            return;
        }

        // Mark order as completed
        order.status = 'completed';
        order.paymentId = paymentId;
        order.completedAt = new Date();

        const addedCredits = order.credits;
        let updatedUser;

        if (memoryStore.isMongoAvailable) {
            const user = await User.findById(userId);
            if (user) {
                user.credits = (user.credits || 0) + addedCredits;
                if (order.type === 'subscription') {
                    user.plan = 'pro';
                }
                await user.save();
                updatedUser = {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    plan: user.plan,
                    credits: user.credits,
                };
            }
        } else {
            // Memory store update
            const user = memoryStore.users.get(userId) || Array.from(memoryStore.users.values())[0];
            if (user) {
                user.credits = (user.credits || 0) + addedCredits;
                if (order.type === 'subscription') {
                    user.plan = 'pro';
                }
                updatedUser = {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    plan: user.plan,
                    credits: user.credits,
                };
            }
        }

        res.json({
            success: true,
            message: `Payment verified! Added ${addedCredits.toLocaleString()} credits to your workspace.`,
            data: {
                order,
                user: updatedUser,
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getPaymentHistory = async (req, res, next) => {
    try {
        const userId = req.userId || 'demo-user-1';
        const userOrders = Array.from(paymentTransactions.values())
            .filter(o => o.userId === userId)
            .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

        res.json({
            success: true,
            data: userOrders,
        });
    } catch (error) {
        next(error);
    }
};
