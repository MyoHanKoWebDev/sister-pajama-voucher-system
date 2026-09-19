import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  ShoppingBag,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Loader2
} from 'lucide-react';
import { getVoucher, deleteVoucher } from '../../services/voucherService';

export default function VoucherDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Custom Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch Voucher Details
  useEffect(() => {
    const fetchVoucherDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getVoucher(id);
        const data = response?.voucher || response?.data || response;
        setVoucher(data);
      } catch (err) {
        console.error('Failed to load voucher detail:', err);
        setError(err.response?.data?.message || 'Failed to load voucher details.');
      } finally {
        setLoading(false);
      }
    };

    fetchVoucherDetail();
  }, [id]);

  // Handle Delete Confirmation inside Modal
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteVoucher(id);
      navigate('/vouchers');
    } catch (err) {
      console.error('Failed to delete voucher:', err);
      alert(err.response?.data?.message || 'Failed to delete voucher.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Format currency in Myanmar Kyat (Ks)
  const formatCurrency = (val) => `${Number(val || 0).toLocaleString()} Ks`;

  // Format created date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center min-h-[50vh] space-y-3 text-brand-muted text-sm">
        <RefreshCw className="w-8 h-8 text-brand-plum animate-spin" />
        <p>Loading voucher details...</p>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <button
          onClick={() => navigate('/vouchers')}
          className="flex items-center gap-2 text-brand-plum font-semibold text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vouchers
        </button>
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-rose-700 font-medium text-sm">{error || 'Voucher not found'}</p>
        </div>
      </div>
    );
  }

  const customer = voucher.customer || {};
  const items = voucher.items || [];
  const deliveryFeeObj = voucher.delivery_fee || {};

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* TOP BAR ACTIONS */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/vouchers')}
          className="flex items-center gap-2 text-sm font-semibold text-brand-muted hover:text-brand-charcoal transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vouchers
        </button>

        <div className="flex items-center gap-2">
          <Link
            to={`/vouchers/${id}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-plum hover:bg-brand-plum-dark text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-semibold rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* VOUCHER CARD RECEIPT */}
      <div className="bg-white border border-brand-beige/80 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden space-y-6">
        
        {/* BRAND TOP STRIPE */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-brand-plum" />

        {/* BUSINESS HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-brand-beige/40 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-cream border border-brand-beige/80 flex items-center justify-center text-brand-plum">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-charcoal">Sisters Pajama</h2>
              <p className="text-xs text-brand-muted">Customer Sales Voucher</p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="inline-block px-3 py-1 bg-brand-cream text-brand-plum font-bold text-sm rounded-xl border border-brand-beige/80 mb-1">
              VOUCHER #{voucher.id}
            </span>
            <p className="text-xs text-brand-muted flex items-center sm:justify-end gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(voucher.created_at)}</span>
            </p>
          </div>
        </div>

        {/* CUSTOMER DETAILS GRID */}
        <div className="bg-brand-cream/40 p-4 rounded-2xl border border-brand-beige/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider flex items-center gap-1">
              <User className="w-3 h-3" /> Customer Name
            </span>
            <p className="font-bold text-brand-charcoal text-sm">{customer.name || '-'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider flex items-center gap-1">
              <Phone className="w-3 h-3" /> Phone
            </span>
            <p className="font-medium text-brand-charcoal font-mono">{customer.phone || '-'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Address
            </span>
            <p className="font-medium text-brand-charcoal">{customer.address || '-'}</p>
          </div>
        </div>

        {/* ORDERED ITEMS TABLE */}
        <div>
          <h3 className="text-xs uppercase font-bold text-brand-muted mb-3 tracking-wider">
            Ordered Pajama Items
          </h3>
          <div className="border border-brand-beige/60 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-cream/60 border-b border-brand-beige/40 text-[11px] uppercase font-bold text-brand-muted tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige/30 text-brand-charcoal">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-xs text-brand-muted">
                      No items recorded on this voucher.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-brand-cream/20 transition-colors">
                      <td className="py-3 px-4 font-medium text-brand-charcoal">
                        {item.item_name}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-brand-muted">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-xs text-brand-muted font-mono">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-brand-plum font-mono">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FINANCIAL CALCULATIONS SUMMARY */}
        <div className="flex justify-end">
          <div className="w-full sm:w-80 space-y-2.5 text-sm bg-brand-cream/30 p-4 rounded-2xl border border-brand-beige/60">
            <div className="flex justify-between text-brand-muted text-xs">
              <span>Subtotal</span>
              <span className="font-semibold text-brand-charcoal font-mono">{formatCurrency(voucher.subtotal)}</span>
            </div>

            <div className="flex justify-between text-brand-muted text-xs">
              <span>Delivery Fee</span>
              <span className="font-semibold text-brand-charcoal font-mono">{formatCurrency(deliveryFeeObj.fee)}</span>
            </div>

            <div className="border-t border-brand-beige/40 pt-2 flex justify-between font-bold text-brand-charcoal">
              <span>Total Amount</span>
              <span className="text-brand-plum font-mono">{formatCurrency(voucher.total)}</span>
            </div>

            <div className="flex justify-between text-xs text-emerald-700">
              <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> Prepaid Fee</span>
              <span className="font-bold font-mono">-{formatCurrency(voucher.prepaid_fee)}</span>
            </div>

            <div className="border-t border-brand-beige/40 pt-2 flex justify-between font-bold text-base bg-brand-cream p-2.5 rounded-xl border border-brand-beige/80">
              <span className="text-brand-charcoal">Remaining Balance</span>
              <span className="text-rose-600 font-mono">{formatCurrency(voucher.remaining_amount)}</span>
            </div>
          </div>
        </div>

        {/* RECEIPT FOOTER */}
        <div className="border-t border-brand-beige/40 pt-4 text-center text-xs text-brand-muted/70">
          Thank you for shopping with Sisters Pajama!
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setShowDeleteModal(false)}
              className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-xs"
            />

            {/* Modal Card */}
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
                <h3 className="text-base font-bold text-brand-charcoal">Delete Voucher #{voucher.id}</h3>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                  Are you sure you want to delete the voucher for <span className="font-semibold text-brand-charcoal">"{customer.name || 'this customer'}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-4 py-2 text-xs font-semibold text-brand-muted hover:text-brand-charcoal transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}