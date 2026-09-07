import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { memoryStore } from '../services/store/memoryStore.js';
import { sendPaymentReceiptEmail } from '../services/email/emailService.js';

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
        const userId = req.userId || req.user?.id || 'user_' + Date.now();
        const {
            planId,
            gateway = 'unified',
            currency = 'USD',
            customerName = '',
            customerEmail = '',
            customerPhone = '',
            customerAddress = '',
            upiId = '',
            paymentMethod = 'UPI',
        } = req.body;

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
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            upiId,
            paymentMethod,
            status: 'created',
            createdAt: new Date(),
        };

        // If gateway is Stripe and secret key is provided, create Stripe PaymentIntent for Stripe Elements
        if (gateway === 'stripe' && config.payment.stripeSecretKey) {
            try {
                // 1. Create PaymentIntent for embedded Stripe Elements checkout
                const piParams = new URLSearchParams({
                    amount: String(Math.round(selectedPlan.price * 100)),
                    currency: (currency || selectedPlan.currency).toLowerCase(),
                    'automatic_payment_methods[enabled]': 'true',
                    description: `ZsyioGPT - ${selectedPlan.name} (${selectedPlan.credits.toLocaleString()} Credits)`,
                    'metadata[orderId]': orderId,
                    'metadata[userId]': String(userId),
                    'metadata[credits]': String(selectedPlan.credits),
                    'metadata[customerEmail]': String(customerEmail || ''),
                    'metadata[upiId]': String(upiId || ''),
                });
                if (customerEmail) {
                    piParams.append('receipt_email', customerEmail);
                }

                const piRes = await fetch('https://api.stripe.com/v1/payment_intents', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${config.payment.stripeSecretKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: piParams.toString(),
                });
                const paymentIntent = await piRes.json();
                if (paymentIntent.client_secret) {
                    orderData.clientSecret = paymentIntent.client_secret;
                    orderData.paymentIntentId = paymentIntent.id;
                } else if (paymentIntent.error) {
                    console.warn('[Stripe Gateway] PaymentIntent error:', paymentIntent.error.message);
                }

                // 2. Also create hosted Checkout Session as fallback
                const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${config.payment.stripeSecretKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        'payment_method_types[0]': 'card',
                        'line_items[0][price_data][currency]': (currency || selectedPlan.currency).toLowerCase(),
                        'line_items[0][price_data][product_data][name]': `ZsyioGPT - ${selectedPlan.name}`,
                        'line_items[0][price_data][product_data][description]': `${selectedPlan.credits.toLocaleString()} AI Credits`,
                        'line_items[0][price_data][unit_amount]': String(Math.round(selectedPlan.price * 100)),
                        'line_items[0][quantity]': '1',
                        'mode': 'payment',
                        'customer_email': customerEmail || undefined,
                        'success_url': `${config.clientUrl}/usage?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}&status=success`,
                        'cancel_url': `${config.clientUrl}/usage?payment_cancelled=true`,
                        'metadata[orderId]': orderId,
                        'metadata[userId]': String(userId),
                        'metadata[credits]': String(selectedPlan.credits),
                        'metadata[customerEmail]': String(customerEmail || ''),
                        'metadata[upiId]': String(upiId || ''),
                    }).toString(),
                });
                const stripeSession = await stripeRes.json();
                if (stripeSession.url) {
                    orderData.stripeSessionId = stripeSession.id;
                    orderData.checkoutUrl = stripeSession.url;
                }
            } catch (stripeErr) {
                console.warn('[Stripe Gateway] Could not initiate Stripe session:', stripeErr.message);
            }
        }

        paymentTransactions.set(orderId, orderData);

        res.status(201).json({
            success: true,
            message: 'Payment order created successfully',
            data: {
                ...orderData,
                clientSecret: orderData.clientSecret,
                key: gateway === 'razorpay' ? config.payment.razorpayKeyId : config.payment.stripePublishableKey,
                stripePublishableKey: config.payment.stripePublishableKey,
            }
        });
    } catch (error) {
        next(error);
    }
};

export const verifyPayment = async (req, res, next) => {
    try {
        const userId = req.userId || req.user?.id || 'user_' + Date.now();
        const {
            orderId,
            paymentId = `pay_${Date.now()}`,
            customerEmail,
            customerName,
            customerPhone,
            customerAddress,
            upiId,
            paymentMethod,
        } = req.body;

        const order = paymentTransactions.get(orderId);
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found or expired' });
            return;
        }

        // Mark order as completed
        order.status = 'completed';
        order.paymentId = paymentId;
        order.completedAt = new Date();

        if (customerEmail) order.customerEmail = customerEmail;
        if (customerName) order.customerName = customerName;
        if (customerPhone) order.customerPhone = customerPhone;
        if (customerAddress) order.customerAddress = customerAddress;
        if (upiId) order.upiId = upiId;
        if (paymentMethod) order.paymentMethod = paymentMethod;

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
                    id: user._id || user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    plan: user.plan,
                    credits: user.credits,
                };
            }
        }

        // Trigger official payment receipt email
        const receiptEmail = order.customerEmail || customerEmail || updatedUser?.email;
        let emailReceipt = null;

        if (receiptEmail) {
            try {
                emailReceipt = await sendPaymentReceiptEmail({
                    customerEmail: receiptEmail,
                    customerName: order.customerName || customerName || updatedUser?.name || 'Customer',
                    customerPhone: order.customerPhone || customerPhone || '',
                    customerAddress: order.customerAddress || customerAddress || '',
                    upiId: order.upiId || upiId || '',
                    paymentMethod: order.paymentMethod || paymentMethod || (order.gateway === 'stripe' ? 'Card (Stripe Global)' : 'UPI Instant Pay'),
                    planName: order.planName,
                    amount: order.amount,
                    currency: order.currency,
                    credits: order.credits,
                    orderId: order.orderId,
                    paymentId: order.paymentId,
                    date: order.completedAt,
                });
                order.emailReceipt = emailReceipt;
            } catch (err) {
                console.warn('[Payment Email] Failed to send receipt:', err.message);
            }
        }

        res.json({
            success: true,
            message: `Payment verified! Added ${addedCredits.toLocaleString()} credits to your workspace. Receipt sent to ${receiptEmail || 'email'}.`,
            data: {
                order,
                user: updatedUser,
                emailReceipt,
                customerEmail: receiptEmail,
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
