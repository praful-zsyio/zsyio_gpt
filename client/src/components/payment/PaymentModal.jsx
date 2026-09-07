import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  X,
  Zap,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Lock,
  ArrowRight,
  RefreshCw,
  Award,
  Flame,
} from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, defaultPlanId = 'pro_pack' }) {
  const { user, updateCredits } = useAuth();
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId);
  const [selectedGateway, setSelectedGateway] = useState('unified');
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  // Fallback plans if offline or loading
  const defaultPlans = [
    {
      id: 'starter_pack',
      name: 'Starter Credits',
      price: 5,
      currency: 'USD',
      credits: 2500,
      badge: 'Beginner',
      features: [
        '2,500 High-Speed Inference Credits',
        'Access to Nano Banana & Gemini Image',
        'Full PDF Studio OCR Engine',
        'Standard Queue Priority',
      ],
    },
    {
      id: 'pro_pack',
      name: 'Creator Pack',
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
      price: 49,
      currency: 'USD',
      credits: 50000,
      badge: 'Best Value',
      features: [
        '50,000 Studio AI Credits',
        'Unlimited Parallel Generations',
        'Dedicated Inference Pipeline',
        'Pro Badge & Priority Support',
      ],
    },
  ];

  useEffect(() => {
    if (!isOpen) return;
    const fetchPlans = async () => {
      setLoadingPlans(true);
      setError('');
      try {
        const res = await api.payment.getPlans();
        if (res.success && res.data?.plans) {
          setPlans(res.data.plans);
        } else {
          setPlans(defaultPlans);
        }
      } catch {
        setPlans(defaultPlans);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [isOpen]);

  const activePlan = (plans.length > 0 ? plans : defaultPlans).find((p) => p.id === selectedPlanId) || defaultPlans[1];

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Create order on backend
      const orderRes = await api.payment.createOrder(activePlan.id, selectedGateway);
      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Could not initiate payment order');
      }

      const { orderId } = orderRes.data;

      // 2. Process / Verify payment (Simulated gateway verification with live server verification)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const verifyRes = await api.payment.verifyPayment(orderId, `pay_${selectedGateway}_${Date.now()}`);
      if (verifyRes.success) {
        const added = activePlan.credits;
        const newTotal = (user?.credits || 0) + added;
        updateCredits(newTotal);
        setSuccessData({
          planName: activePlan.name,
          addedCredits: added,
          newTotal,
          orderId,
        });
      } else {
        throw new Error(verifyRes.message || 'Payment verification failed');
      }
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessData(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="max-w-3xl w-full glass-panel bg-dark-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-auto relative"
        >
          {/* Header */}
          <div className="relative p-5 sm:p-6 pb-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-brand-cyan p-0.5 shadow-glow-amber">
                <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>Workspace Credit Top-Up & Plans</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-cyan/15 text-brand-cyan font-mono border border-brand-cyan/30">
                    Instant
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Power up your AI chats, Nano Banana image creations, and video syntheses.
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors touch-press"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-6">
            {successData ? (
              /* Success Screen */
              <div className="text-center py-6 sm:py-8 space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-glow-emerald"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
                <div>
                  <h4 className="text-xl font-bold text-white">Payment Successful!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Your account has been replenished with{' '}
                    <span className="font-bold text-amber-400 font-mono">
                      +{successData.addedCredits.toLocaleString()} Credits
                    </span>
                    .
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-dark-950 border border-white/10 max-w-sm mx-auto text-left space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Package</span>
                    <span className="font-bold text-white">{successData.planName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">New Balance</span>
                    <span className="font-bold font-mono text-emerald-400">
                      {successData.newTotal.toLocaleString()} Credits
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Transaction ID</span>
                    <span className="font-mono text-[10px] text-slate-500 truncate max-w-[150px]">
                      {successData.orderId}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl btn-neon-primary text-xs font-semibold"
                >
                  Return to Workspace
                </button>
              </div>
            ) : (
              /* Package Selection & Checkout */
              <>
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                    {error}
                  </div>
                )}

                {/* Plan Selection Grid */}
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-2.5 block">Select Package</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(plans.length > 0 ? plans : defaultPlans)
                      .filter((p) => p.type !== 'subscription')
                      .map((plan) => {
                        const active = selectedPlanId === plan.id;
                        return (
                          <div
                            key={plan.id}
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={`relative p-4 rounded-2xl border transition-all cursor-pointer touch-press flex flex-col justify-between ${
                              active
                                ? 'bg-amber-500/15 border-amber-400 shadow-glow-amber/20'
                                : 'bg-dark-950/70 border-white/10 hover:border-white/20'
                            }`}
                          >
                            {plan.popular && (
                              <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-400 text-dark-950 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-lg">
                                <Flame className="w-2.5 h-2.5 fill-dark-950" />
                                <span>{plan.badge || 'Popular'}</span>
                              </span>
                            )}

                            <div>
                              <p className="text-xs font-semibold text-slate-300">{plan.name}</p>
                              <div className="flex items-baseline gap-1 my-1.5">
                                <span className="text-2xl font-bold text-white">${plan.price}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-mono">{plan.currency}</span>
                              </div>
                              <p className="text-xs font-bold font-mono text-amber-400 flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                                <span>{plan.credits.toLocaleString()} Credits</span>
                              </p>
                            </div>

                            <ul className="mt-3 pt-3 border-t border-white/5 space-y-1">
                              {plan.features.slice(0, 2).map((feat, idx) => (
                                <li key={idx} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                  <span className="truncate">{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-2 block">Choose Payment Gateway</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedGateway('unified')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all touch-press ${
                        selectedGateway === 'unified'
                          ? 'bg-brand-cyan/15 border-brand-cyan text-white'
                          : 'bg-dark-950 border-white/5 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-brand-cyan" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold">Instant Card / UPI</p>
                        <p className="text-[10px] text-slate-400">Zero-Fee Checkout</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedGateway('stripe')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all touch-press ${
                        selectedGateway === 'stripe'
                          ? 'bg-brand-purple/20 border-brand-purple text-white'
                          : 'bg-dark-950 border-white/5 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-brand-purple" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold">Stripe Global</p>
                        <p className="text-[10px] text-slate-400">135+ Currencies</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedGateway('razorpay')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all touch-press ${
                        selectedGateway === 'razorpay'
                          ? 'bg-amber-500/15 border-amber-400 text-white'
                          : 'bg-dark-950 border-white/5 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <Award className="w-4 h-4 text-amber-400" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold">Razorpay</p>
                        <p className="text-[10px] text-slate-400">UPI & NetBanking</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Order Summary Bar & Pay Button */}
                <div className="p-4 rounded-2xl bg-dark-950 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Total Due: <span className="text-emerald-400">${activePlan.price} USD</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Adds {activePlan.credits.toLocaleString()} Credits instantly to your balance
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl btn-neon-primary text-xs font-bold flex items-center justify-center gap-2 touch-press disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying Transaction...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Payment</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
