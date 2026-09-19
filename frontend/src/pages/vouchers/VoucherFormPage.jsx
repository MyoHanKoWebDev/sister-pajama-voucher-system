import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Truck,
  CreditCard,
  Receipt,
  ShoppingBag,
  Loader2
} from 'lucide-react';
import { getItems } from '../../services/itemService';
import { getVoucher, createVoucher, updateVoucher, getDeliveryFees } from '../../services/voucherService';

export default function VoucherFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Catalog & Delivery Fee States from Database
  const [availableItems, setAvailableItems] = useState([]);
  const [deliveryFees, setDeliveryFees] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Form State
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [selectedItems, setSelectedItems] = useState([
    { item_id: '', quantity: 1, unit_price: 0, amount: 0 }
  ]);
  const [selectedDeliveryFeeId, setSelectedDeliveryFeeId] = useState('');
  const [prepaidFee, setPrepaidFee] = useState(0);

  // Operation States
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatCurrency = (val) => `${Number(val || 0).toLocaleString()} Ks`;

  // 1. Fetch catalog items, delivery fees, and voucher details (if editing)
  useEffect(() => {
    const initPageData = async () => {
      try {
        const [itemsRes, feesRes] = await Promise.all([
          getItems(),
          getDeliveryFees()
        ]);

        const itemsList = Array.isArray(itemsRes) ? itemsRes : itemsRes?.data || itemsRes?.items || [];
        setAvailableItems(itemsList);

        const feesList = Array.isArray(feesRes) ? feesRes : feesRes?.delivery_fees || feesRes?.data || [];
        setDeliveryFees(feesList);

        if (feesList.length > 0) {
          setSelectedDeliveryFeeId(String(feesList[0].id));
        }

        if (isEditMode) {
          const voucherRes = await getVoucher(id);
          const v = voucherRes?.voucher || voucherRes?.data || voucherRes;

          if (v) {
            setCustomer({
              name: v.customer?.name || v.customer_name || '',
              phone: v.customer?.phone || v.customer_phone || '',
              address: v.customer?.address || v.customer_address || '',
            });

            if (Array.isArray(v.items) && v.items.length > 0) {
              setSelectedItems(
                v.items.map((i) => {
                  const qty = Number(i.quantity) || 1;
                  const price = Number(i.unit_price || i.price) || 0;
                  return {
                    item_id: String(i.item_id || i.id),
                    quantity: qty,
                    unit_price: price,
                    amount: price * qty,
                  };
                })
              );
            }

            const activeFeeId = v.delivery_fee?.id || v.delivery_fee_id;
            if (activeFeeId) {
              setSelectedDeliveryFeeId(String(activeFeeId));
            }

            setPrepaidFee(Number(v.prepaid_fee || 0));
          }
        }
      } catch (err) {
        console.error('Error loading voucher form data:', err);
        setFormErrors({ general: 'Failed to load items or delivery options from backend.' });
      } finally {
        setLoadingCatalog(false);
        setLoadingData(false);
      }
    };

    initPageData();
  }, [id, isEditMode]);

  // Item Row Handlers
  const handleItemSelect = (index, itemId) => {
    const selected = availableItems.find((i) => String(i.id) === String(itemId));
    const price = selected ? Number(selected.price) : 0;

    const updated = [...selectedItems];
    const target = { ...updated[index] };
    target.item_id = itemId;
    target.unit_price = price;
    target.amount = price * target.quantity;

    updated[index] = target;
    setSelectedItems(updated);
  };

  const handleQuantityChange = (index, qtyVal) => {
    const qty = Math.max(1, parseInt(qtyVal) || 1);
    const updated = [...selectedItems];
    const target = { ...updated[index] };
    target.quantity = qty;
    target.amount = target.unit_price * qty;

    updated[index] = target;
    setSelectedItems(updated);
  };

  const handleAddItemRow = () => {
    setSelectedItems([
      ...selectedItems,
      { item_id: '', quantity: 1, unit_price: 0, amount: 0 },
    ]);
  };

  const handleRemoveItemRow = (index) => {
    if (selectedItems.length === 1) return;
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  // Dynamic Financial Calculations
  // Correctly handle 0 fee without defaulting away from zero
const activeDeliveryFeeObj = deliveryFees.find((f) => String(f.id) === String(selectedDeliveryFeeId));
const deliveryFeeAmount = activeDeliveryFeeObj ? Number(activeDeliveryFeeObj.fee) : 0;

// Subtotal & Total Calculations
const subtotal = selectedItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
const total = subtotal + deliveryFeeAmount;
const remainingAmount = Math.max(0, total - Number(prepaidFee || 0));

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!customer.name.trim()) errors.name = 'Customer name is required.';
    if (!customer.phone.trim()) errors.phone = 'Phone number is required.';
    if (!customer.address.trim()) errors.address = 'Delivery address is required.';

    if (!selectedDeliveryFeeId) errors.delivery_fee = 'Please select a delivery fee option.';

    if (selectedItems.some((row) => !row.item_id)) {
      errors.items = 'Please select a pajama item for every row.';
    }

    if (prepaidFee < 0) errors.prepaid = 'Prepaid fee cannot be negative.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submit (Create / Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const payload = {
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
      },
      items: selectedItems.map((i) => ({
        item_id: Number(i.item_id),
        quantity: Number(i.quantity),
      })),
      delivery_fee_id: Number(selectedDeliveryFeeId),
      prepaid_fee: Number(prepaidFee || 0),
    };

    try {
      if (isEditMode) {
        await updateVoucher(id, payload);
        showToast('Voucher updated successfully!');
        setTimeout(() => navigate(`/vouchers/${id}`), 800);
      } else {
        await createVoucher(payload);
        showToast('Voucher created successfully!');
        setTimeout(() => navigate('/vouchers'), 800);
      }
    } catch (err) {
      console.error('Failed to save voucher:', err);
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        setFormErrors(apiErrors);
      } else {
        setFormErrors({ general: err.response?.data?.message || 'Failed to submit voucher to server.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCatalog || loadingData) {
    return (
      <div className="p-16 flex flex-col items-center justify-center min-h-[50vh] space-y-3 text-brand-muted text-sm">
        <Loader2 className="w-8 h-8 text-brand-plum animate-spin" />
        <p>{isEditMode ? 'Loading voucher details...' : 'Loading options...'}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-5xl mx-auto"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-beige/60 shadow-card">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/vouchers')}
            className="p-2.5 rounded-2xl bg-brand-cream border border-brand-beige/80 text-brand-plum hover:bg-brand-beige/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-brand-charcoal tracking-tight">
              {isEditMode ? `Edit Voucher #${id}` : 'Create Voucher'}
            </h1>
            <p className="text-sm text-brand-muted mt-0.5">
              {isEditMode ? 'Update customer order and items.' : 'Issue customer sales vouchers with live price calculation.'}
            </p>
          </div>
        </div>
      </div>

      {/* GLOBAL ERROR DISPLAY */}
      {formErrors.general && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{formErrors.general}</span>
        </div>
      )}

      {/* FORM LAYOUT */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Customer, Items & Delivery */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. CUSTOMER INFORMATION */}
          <div className="bg-white p-6 rounded-3xl border border-brand-beige/60 shadow-card space-y-4">
            <div className="flex items-center gap-2.5 border-b border-brand-beige/40 pb-3">
              <User className="w-5 h-5 text-brand-plum" />
              <h2 className="text-base font-bold text-brand-charcoal">Customer Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1.5">
                  Customer Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Aung Aung"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    disabled={submitting}
                    className={`w-full pl-10 pr-4 py-2.5 bg-brand-cream/30 border rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-plum transition-colors ${
                      formErrors.name ? 'border-rose-400 bg-rose-50/20' : 'border-brand-beige/80'
                    }`}
                  />
                  <User className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {formErrors.name && <p className="text-xs text-rose-500 mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1.5">
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 09123456789"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    disabled={submitting}
                    className={`w-full pl-10 pr-4 py-2.5 bg-brand-cream/30 border rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-plum transition-colors ${
                      formErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-brand-beige/80'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {formErrors.phone && <p className="text-xs text-rose-500 mt-1">{formErrors.phone}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1.5">
                  Delivery Address *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. No. 123, 73rd Street, Mandalay"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    disabled={submitting}
                    className={`w-full pl-10 pr-4 py-2.5 bg-brand-cream/30 border rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-plum transition-colors ${
                      formErrors.address ? 'border-rose-400 bg-rose-50/20' : 'border-brand-beige/80'
                    }`}
                  />
                  <MapPin className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {formErrors.address && <p className="text-xs text-rose-500 mt-1">{formErrors.address}</p>}
              </div>
            </div>
          </div>

          {/* 2. PAJAMA ORDER ITEMS */}
          <div className="bg-white p-6 rounded-3xl border border-brand-beige/60 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-brand-beige/40 pb-3">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-brand-plum" />
                <h2 className="text-base font-bold text-brand-charcoal">Order Items</h2>
              </div>

              <button
                type="button"
                onClick={handleAddItemRow}
                disabled={submitting}
                className="px-3.5 py-2 bg-brand-cream hover:bg-brand-beige/50 text-brand-plum rounded-xl border border-brand-beige/80 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {formErrors.items && <p className="text-xs text-rose-500">{formErrors.items}</p>}

            <div className="space-y-3">
              {selectedItems.map((row, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-brand-cream/30 border border-brand-beige/60 grid grid-cols-12 gap-3 items-center"
                >
                  <div className="col-span-12 sm:col-span-5">
                    <label className="block sm:hidden text-[10px] font-semibold text-brand-muted uppercase mb-1">Item</label>
                    <select
                      value={row.item_id}
                      onChange={(e) => handleItemSelect(idx, e.target.value)}
                      disabled={submitting}
                      className="w-full px-3 py-2 bg-white border border-brand-beige/80 rounded-xl text-xs text-brand-charcoal focus:outline-none focus:border-brand-plum"
                    >
                      <option value="">-- Select Pajama --</option>
                      {availableItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({formatCurrency(item.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <label className="block sm:hidden text-[10px] font-semibold text-brand-muted uppercase mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) => handleQuantityChange(idx, e.target.value)}
                      disabled={submitting}
                      className="w-full px-3 py-2 bg-white border border-brand-beige/80 rounded-xl text-xs text-center font-bold text-brand-charcoal focus:outline-none focus:border-brand-plum"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2 text-right">
                    <span className="text-xs text-brand-muted font-mono">{formatCurrency(row.unit_price)}</span>
                  </div>

                  <div className="col-span-3 sm:col-span-2 text-right">
                    <span className="text-xs font-bold text-brand-plum font-mono">{formatCurrency(row.amount)}</span>
                  </div>

                  <div className="col-span-1 text-right flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      disabled={selectedItems.length === 1 || submitting}
                      className="p-1.5 text-brand-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. DELIVERY & PAYMENT */}
          <div className="bg-white p-6 rounded-3xl border border-brand-beige/60 shadow-card space-y-4">
            <div className="flex items-center gap-2.5 border-b border-brand-beige/40 pb-3">
              <Truck className="w-5 h-5 text-brand-plum" />
              <h2 className="text-base font-bold text-brand-charcoal">Delivery & Payment</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* DYNAMIC DELIVERY FEE SELECT FROM DATABASE */}
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1.5">
                  Delivery Fee Option *
                </label>
                <div className="relative">
                  <select
                    value={selectedDeliveryFeeId}
                    onChange={(e) => setSelectedDeliveryFeeId(e.target.value)}
                    disabled={submitting}
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-cream/30 border border-brand-beige/80 rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-plum"
                  >
                    {deliveryFees.map((feeObj) => (
                      <option key={feeObj.id} value={feeObj.id}>
                       #{feeObj.id} ({formatCurrency(feeObj.fee)})
                      </option>
                    ))}
                  </select>
                  <Truck className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {formErrors.delivery_fee && <p className="text-xs text-rose-500 mt-1">{formErrors.delivery_fee}</p>}
              </div>

              {/* PREPAID FEE */}
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1.5">
                  Prepaid Amount (Ks)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={prepaidFee}
                    onChange={(e) => setPrepaidFee(Math.max(0, Number(e.target.value) || 0))}
                    disabled={submitting}
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-cream/30 border border-brand-beige/80 rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-plum font-mono"
                  />
                  <CreditCard className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {formErrors.prepaid && <p className="text-xs text-rose-500 mt-1">{formErrors.prepaid}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FINANCIAL SUMMARY */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-3xl border border-brand-beige/60 shadow-card space-y-6 sticky top-6">
            <div className="flex items-center gap-2.5 border-b border-brand-beige/40 pb-3">
              <Receipt className="w-5 h-5 text-brand-plum" />
              <h2 className="text-base font-bold text-brand-charcoal">Voucher Summary</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-brand-charcoal font-mono">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-brand-muted">
                <span>Delivery Fee</span>
                <span className="font-semibold text-brand-charcoal font-mono">{formatCurrency(deliveryFeeAmount)}</span>
              </div>

              <div className="border-t border-brand-beige/40 pt-3 flex justify-between text-base font-bold text-brand-charcoal">
                <span>Total Amount</span>
                <span className="text-brand-plum font-mono">{formatCurrency(total)}</span>
              </div>

              <div className="flex justify-between text-brand-muted">
                <span>Prepaid Fee</span>
                <span className="font-semibold text-emerald-600 font-mono">-{formatCurrency(prepaidFee)}</span>
              </div>

              <div className="border-t border-brand-beige/40 pt-3 flex justify-between text-base font-bold text-brand-charcoal bg-brand-cream/50 p-3 rounded-2xl border border-brand-beige/60">
                <span>Remaining Balance</span>
                <span className="text-rose-600 font-mono">{formatCurrency(remainingAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-brand-plum hover:bg-brand-plum-dark text-white font-semibold text-sm rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isEditMode ? 'Updating Voucher...' : 'Creating Voucher...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditMode ? 'Save Changes' : 'Create Voucher'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}