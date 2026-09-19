import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Receipt, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Loader2
} from 'lucide-react';
import { getVouchers, deleteVoucher } from '../../services/voucherService';

export default function VouchersPage() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast feedback state
  const [toast, setToast] = useState(null);

  // Delete modal state
  const [deletingVoucher, setDeletingVoucher] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchVouchers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getVouchers();
      const data = Array.isArray(res) ? res : res?.data || res?.vouchers || [];
      setVouchers(data);
    } catch (err) {
      console.error('Failed to load vouchers:', err);
      setError(err.response?.data?.message || 'Failed to fetch vouchers from backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Instant local delete (Optimistic UI)
  const handleDeleteConfirm = async () => {
    if (!deletingVoucher) return;
    const targetId = deletingVoucher.id;

    setVouchers((prev) => prev.filter((v) => v.id !== targetId));
    setDeletingVoucher(null);
    showToast('Voucher deleted successfully!');

    try {
      await deleteVoucher(targetId);
    } catch (err) {
      console.error('Failed to delete voucher:', err);
      showToast('Failed to delete voucher on server.', 'error');
      fetchVouchers();
    }
  };

  // Filter vouchers by customer name or phone
  const filteredVouchers = vouchers.filter((v) => {
    const name = v.customer?.name || v.customer_name || '';
    const phone = v.customer?.phone || v.customer_phone || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || phone.toLowerCase().includes(query);
  });

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return `${num.toLocaleString()} Ks`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* TOAST FEEDBACK */}
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-beige/60 shadow-card">
        <div>
          <h1 className="text-2xl font-bold text-brand-charcoal tracking-tight">Vouchers</h1>
          <p className="text-sm text-brand-muted mt-0.5">
            Manage customer sales orders and delivery payment records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchVouchers}
            disabled={loading}
            className="p-3 bg-brand-cream hover:bg-brand-beige/50 text-brand-plum rounded-2xl border border-brand-beige/80 transition-colors disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/vouchers/create')}
            className="px-5 py-3 bg-brand-plum hover:bg-brand-plum-dark text-white text-sm font-semibold rounded-2xl shadow-md shadow-brand-plum/10 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Voucher</span>
          </motion.button>
        </div>
      </div>

      {/* GLOBAL ERROR DISPLAY */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchVouchers}
            className="text-xs font-semibold uppercase underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="bg-white rounded-3xl border border-brand-beige/60 shadow-card overflow-hidden">
        
        {/* FILTER & SEARCH HEADER */}
        <div className="p-4 sm:p-6 border-b border-brand-beige/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-brand-cream/50 border border-brand-beige/80 rounded-xl text-sm focus:outline-none focus:border-brand-plum text-brand-charcoal transition-colors placeholder:text-brand-muted/70"
            />
          </div>

          <div className="text-xs font-semibold text-brand-muted">
            Total Vouchers: <span className="text-brand-plum font-bold">{filteredVouchers.length}</span>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="p-16 text-center text-brand-muted text-sm space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-rose" />
            <p>Loading customer vouchers...</p>
          </div>
        ) : filteredVouchers.length === 0 ? (
          /* EMPTY STATE */
          <div className="p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-cream border border-brand-beige/80 mx-auto flex items-center justify-center text-brand-rose">
              <Receipt className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-brand-charcoal">
                {searchQuery ? 'No matching vouchers found' : 'No vouchers issued yet'}
              </h4>
              <p className="text-xs text-brand-muted max-w-sm mx-auto mt-1">
                {searchQuery
                  ? `No vouchers match "${searchQuery}". Try searching with a different name or phone number.`
                  : 'Start issuing customer orders to generate sales vouchers.'}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => navigate('/vouchers/create')}
                className="px-4 py-2.5 bg-brand-plum text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 hover:bg-brand-plum-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Voucher</span>
              </button>
            )}
          </div>
        ) : (
          /* TABLE CONTENT */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-cream/60 border-b border-brand-beige/40 text-[11px] uppercase font-bold text-brand-muted tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Voucher #</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Phone</th>
                  <th className="py-3.5 px-6 text-center">Items</th>
                  <th className="py-3.5 px-6">Total</th>
                  <th className="py-3.5 px-6">Prepaid</th>
                  <th className="py-3.5 px-6">Remaining</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige/30 text-brand-charcoal">
                {filteredVouchers.map((voucher) => {
                  const id = voucher.id;
                  const name = voucher.customer?.name || voucher.customer_name || 'Guest';
                  const phone = voucher.customer?.phone || voucher.customer_phone || '-';
                  const itemCount = voucher.items?.length || 0;
                  const total = Number(voucher.total || voucher.total_amount) || 0;
                  const prepaid = Number(voucher.prepaid_fee || voucher.prepaid_amount) || 0;
                  const remaining = Number(voucher.remaining_amount || (total - prepaid)) || 0;
                  const createdDate = voucher.created_at
                    ? new Date(voucher.created_at).toLocaleDateString()
                    : '-';

                  return (
                    <tr key={id} className="hover:bg-brand-cream/40 transition-colors">
                      <td className="py-4 px-6 font-semibold text-brand-plum">
                        #{id}
                      </td>
                      <td className="py-4 px-6 font-medium">
                        {name}
                      </td>
                      <td className="py-4 px-6 text-xs text-brand-muted font-mono">
                        {phone}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-brand-cream text-brand-plum font-semibold text-xs border border-brand-beige/60">
                          {itemCount}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        {formatCurrency(total)}
                      </td>
                      <td className="py-4 px-6 text-emerald-600 font-medium">
                        {formatCurrency(prepaid)}
                      </td>
                      <td className="py-4 px-6 font-medium">
                        {remaining > 0 ? (
                          <span className="text-amber-600">{formatCurrency(remaining)}</span>
                        ) : (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold">
                            Paid
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-brand-muted">
                        {createdDate}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/vouchers/${id}`)}
                            className="p-2 hover:bg-brand-beige/40 rounded-xl text-brand-plum transition-colors"
                            title="View Voucher"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/vouchers/${id}/edit`)}
                            className="p-2 hover:bg-brand-beige/40 rounded-xl text-brand-plum transition-colors"
                            title="Edit Voucher"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingVoucher(voucher)}
                            className="p-2 hover:bg-rose-100/60 rounded-xl text-rose-600 transition-colors"
                            title="Delete Voucher"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingVoucher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingVoucher(null)}
              className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-brand-beige/80 z-10 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-brand-charcoal">Delete Voucher #{deletingVoucher.id}</h3>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                  Are you sure you want to delete the voucher for <span className="font-semibold text-brand-charcoal font-medium">"{deletingVoucher.customer?.name || 'this customer'}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingVoucher(null)}
                  className="px-4 py-2 text-xs font-semibold text-brand-muted hover:text-brand-charcoal transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2"
                >
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}