import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateAdminProfile } from '../../services/adminService';

export default function SettingsPage() {
  // Correctly destructure admin and updateAdminState from AuthContext
  const { admin, updateAdminState } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (admin) {
      setFormData((prev) => ({
        ...prev,
        name: admin.name || '',
        email: admin.email || '',
      }));
    }
  }, [admin]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
    };

    if (formData.new_password) {
      payload.current_password = formData.current_password;
      payload.new_password = formData.new_password;
      payload.new_password_confirmation = formData.new_password_confirmation;
    }

    try {
      const response = await updateAdminProfile(payload);
      
      // Update global AuthContext & localStorage using helper
      if (response.admin) {
        updateAdminState(response.admin);
      }

      showToast('Admin profile updated successfully!');

      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      }));
    } catch (err) {
    console.error('Failed to update admin profile:', err);

    const responseData = err.response?.data;
    const apiErrors = responseData?.errors;

    if (apiErrors) {
      setErrors(apiErrors);
    } else if (responseData?.message) {
      setErrors({ general: responseData.message });
    } else {
      setErrors({ general: 'Failed to update profile. Please try again.' });
    }

    showToast('Failed to update profile.', 'error');
  } finally {
    setSubmitting(false);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium border ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-brand-beige/60 shadow-card">
        <h1 className="text-2xl font-bold text-brand-charcoal tracking-tight">Account Settings</h1>
        <p className="text-sm text-brand-muted mt-0.5">
          Manage your administrator profile details and security credentials.
        </p>
      </div>

      {/* GLOBAL ERROR */}
      {errors.general && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* PROFILE INFORMATION CARD */}
        <div className="bg-white p-6 rounded-3xl border border-brand-beige/60 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-brand-beige/40 pb-3">
            <User className="w-5 h-5 text-brand-plum" />
            <h2 className="text-base font-bold text-brand-charcoal">Profile Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1.5">
                Admin Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className={`w-full pl-10 pr-4 py-2.5 bg-brand-cream/30 border rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-plum transition-colors ${
                    errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-brand-beige/80'
                  }`}
                />
                <User className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className={`w-full pl-10 pr-4 py-2.5 bg-brand-cream/30 border rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-plum transition-colors ${
                    errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-brand-beige/80'
                  }`}
                />
                <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email[0]}</p>}
            </div>
          </div>
        </div>

        {/* CHANGE PASSWORD CARD */}
        <div className="bg-white p-6 rounded-3xl border border-brand-beige/60 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-brand-beige/40 pb-3">
            <ShieldCheck className="w-5 h-5 text-brand-plum" />
            <h2 className="text-base font-bold text-brand-charcoal">Change Password</h2>
            <span className="text-xs text-brand-muted font-normal">(Leave empty if keeping current password)</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="current_password"
                  placeholder="Enter current password"
                  value={formData.current_password}
                  onChange={handleChange}
                  disabled={submitting}
                  className={`w-full pl-10 pr-4 py-2.5 bg-brand-cream/30 border rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-plum transition-colors ${
                    errors.current_password ? 'border-rose-400 bg-rose-50/20' : 'border-brand-beige/80'
                  }`}
                />
                <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {errors.current_password && <p className="text-xs text-rose-500 mt-1">{errors.current_password[0]}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="new_password"
                    placeholder="At least 6 characters"
                    value={formData.new_password}
                    onChange={handleChange}
                    disabled={submitting}
                    className={`w-full pl-10 pr-4 py-2.5 bg-brand-cream/30 border rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-plum transition-colors ${
                      errors.new_password ? 'border-rose-400 bg-rose-50/20' : 'border-brand-beige/80'
                    }`}
                  />
                  <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {errors.new_password && <p className="text-xs text-rose-500 mt-1">{errors.new_password[0]}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="new_password_confirmation"
                    placeholder="Repeat new password"
                    value={formData.new_password_confirmation}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-cream/30 border border-brand-beige/80 rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-plum transition-colors"
                  />
                  <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-brand-plum hover:bg-brand-plum-dark text-white font-semibold text-sm rounded-2xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}