import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, ShoppingBag, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || err.message || 'Invalid credentials. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-brand-cream flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-card border border-brand-beige/60 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]"
      >
        {/* LEFT BRANDING PANEL */}
        <div className="lg:col-span-5 bg-brand-plum text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Decorative Gradient Blurs */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-brand-rose/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-plum-light rounded-full blur-2xl pointer-events-none" />

          {/* Top Logo Header */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-rose/20 border border-brand-rose/30 flex items-center justify-center text-brand-rose">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-lg tracking-tight leading-none text-white">
                Sisters Pajama
              </h1>
              <span className="text-[11px] text-brand-rose-light tracking-wide uppercase font-medium">
                Voucher Management
              </span>
            </div>
          </div>

          {/* Center Visual/Copy Area */}
          <div className="relative z-10 my-10 lg:my-0 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-brand-rose-light text-xs font-medium backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-brand-rose" />
              <span>Admin Portal v1.0</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
              Manage your pajama orders with ease.
            </h2>

            <p className="text-brand-beige/80 text-sm leading-relaxed max-w-sm">
              Digitize daily voucher generation, track customer records, and streamline operational inventory seamlessly.
            </p>
          </div>

          {/* Bottom Footer Info */}
          <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-brand-beige/60">
            <span>© {new Date().getFullYear()} Sisters Pajama</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              API Connected
            </span>
          </div>
        </div>

        {/* RIGHT LOGIN FORM PANEL */}
        <div className="lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-8">
            {/* Header */}
            <div>
              <h3 className="text-2xl font-bold text-brand-charcoal tracking-tight">
                Welcome back
              </h3>
              <p className="text-sm text-brand-muted mt-1">
                Enter your administrative credentials to access the portal.
              </p>
            </div>

            {/* Error Message Box */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Authentication Failed</p>
                    <p className="text-xs text-rose-600 mt-0.5">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal/80">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-brand-cream/50 border border-brand-beige rounded-xl text-sm text-brand-charcoal placeholder-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal/80">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-brand-cream/50 border border-brand-beige rounded-xl text-sm text-brand-charcoal placeholder-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-plum/20 focus:border-brand-plum transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brand-muted hover:text-brand-plum transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-brand-plum hover:bg-brand-plum-dark text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-plum/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}