import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Package, 
  RefreshCw, 
  AlertCircle, 
  X, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { getItems, createItem, updateItem, deleteItem } from '../../services/itemService';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // Form state & Validation
  const [formData, setFormData] = useState({ name: '', price: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch Items on mount
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getItems();
      // Normalize response (handles array directly or paginated object)
      const data = Array.isArray(res) ? res : res?.data || res?.items || [];
      setItems(data);
    } catch (err) {
      console.error('Failed to load items:', err);
      setError(err.response?.data?.message || 'Failed to fetch items from backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Show auto-hiding toast feedback
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Open modal for creation
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({ name: '', price: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, price: item.price });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Validate Form Inputs
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Item name is required.';
    }
    if (formData.price === '' || formData.price === null || formData.price === undefined) {
      errors.price = 'Price is required.';
    } else if (isNaN(formData.price)) {
      errors.price = 'Price must be a valid number.';
    } else if (Number(formData.price) < 0) {
      errors.price = 'Price cannot be negative.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
    };

    try {
      if (editingItem) {
        await updateItem(editingItem.id, payload);
        showToast('Item updated successfully!');
      } else {
        await createItem(payload);
        showToast('Item created successfully!');
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error('API Error:', err);
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        setFormErrors(apiErrors);
      } else {
        setFormErrors({ general: err.response?.data?.message || 'Operation failed. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    setSubmitting(true);
    try {
      await deleteItem(deletingItem.id);
      showToast('Item deleted successfully!');
      setDeletingItem(null);
      fetchItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
      setError(err.response?.data?.message || 'Unable to delete item.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter items by search query
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format currency in Myanmar Kyats (Ks)
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
          <h1 className="text-2xl font-bold text-brand-charcoal tracking-tight">Items</h1>
          <p className="text-sm text-brand-muted mt-0.5">
            Manage pajama inventory items and pricing structure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchItems}
            disabled={loading}
            className="p-3 bg-brand-cream hover:bg-brand-beige/50 text-brand-plum rounded-2xl border border-brand-beige/80 transition-colors disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenCreateModal}
            className="px-5 py-3 bg-brand-plum hover:bg-brand-plum-dark text-white text-sm font-semibold rounded-2xl shadow-md shadow-brand-plum/10 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
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
            onClick={fetchItems}
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
              placeholder="Search items by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-brand-cream/50 border border-brand-beige/80 rounded-xl text-sm focus:outline-none focus:border-brand-plum text-brand-charcoal transition-colors placeholder:text-brand-muted/70"
            />
          </div>

          <div className="text-xs font-semibold text-brand-muted">
            Total Items: <span className="text-brand-plum font-bold">{filteredItems.length}</span>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="p-16 text-center text-brand-muted text-sm space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-rose" />
            <p>Loading inventory items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          /* EMPTY STATE */
          <div className="p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-cream border border-brand-beige/80 mx-auto flex items-center justify-center text-brand-rose">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-brand-charcoal">
                {searchQuery ? 'No matching items found' : 'No items added yet'}
              </h4>
              <p className="text-xs text-brand-muted max-w-sm mx-auto mt-1">
                {searchQuery
                  ? `No items match "${searchQuery}". Try clearing your search query.`
                  : 'Start adding pajama inventory items to build your voucher catalog.'}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 bg-brand-plum text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 hover:bg-brand-plum-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Item</span>
              </button>
            )}
          </div>
        ) : (
          /* TABLE CONTENT */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-cream/60 border-b border-brand-beige/40 text-[11px] uppercase font-bold text-brand-muted tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">#</th>
                  <th className="py-3.5 px-6">Item Name</th>
                  <th className="py-3.5 px-6">Price</th>
                  <th className="py-3.5 px-6">Created Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige/30 text-brand-charcoal">
                {filteredItems.map((item, idx) => {
                  const createdDate = item.created_at
                    ? new Date(item.created_at).toLocaleDateString()
                    : '-';

                  return (
                    <tr key={item.id} className="hover:bg-brand-cream/40 transition-colors">
                      <td className="py-4 px-6 font-semibold text-brand-muted text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-4 px-6 font-medium text-brand-charcoal">
                        {item.name}
                      </td>
                      <td className="py-4 px-6 font-semibold text-brand-plum">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-4 px-6 text-xs text-brand-muted">
                        {createdDate}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-2 hover:bg-brand-beige/40 rounded-xl text-brand-plum transition-colors"
                            title="Edit Item"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-2 hover:bg-rose-100/60 rounded-xl text-rose-600 transition-colors"
                            title="Delete Item"
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

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setIsModalOpen(false)}
              className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-beige/80 z-10 space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-brand-beige/40 pb-4">
                <h3 className="text-lg font-bold text-brand-charcoal">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="p-1 rounded-xl text-brand-muted hover:text-brand-charcoal hover:bg-brand-cream transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* General Form Error */}
              {formErrors.general && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{formErrors.general}</span>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Item Name */}
                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1.5">
                    Item Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flower Pajama - Red"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={submitting}
                    className={`w-full px-4 py-2.5 bg-brand-cream/30 border rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-plum transition-colors ${
                      formErrors.name ? 'border-rose-400 bg-rose-50/20' : 'border-brand-beige/80'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Price (In Kyats) */}
                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-1.5">
                    Price (Ks) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      disabled={submitting}
                      className={`w-full px-4 py-2.5 bg-brand-cream/30 border rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-plum transition-colors ${
                        formErrors.price ? 'border-rose-400 bg-rose-50/20' : 'border-brand-beige/80'
                      }`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-muted">
                      Ks
                    </span>
                  </div>
                  {formErrors.price && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.price}</p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-beige/40">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                    className="px-4 py-2.5 text-xs font-semibold text-brand-muted hover:text-brand-charcoal transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-brand-plum hover:bg-brand-plum-dark text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingItem ? 'Save Changes' : 'Create Item'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setDeletingItem(null)}
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
                <h3 className="text-base font-bold text-brand-charcoal">Delete Item</h3>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-brand-charcoal font-medium">"{deletingItem.name}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingItem(null)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-brand-muted hover:text-brand-charcoal transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={submitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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