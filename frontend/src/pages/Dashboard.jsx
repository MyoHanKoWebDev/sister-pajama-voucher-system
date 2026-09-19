import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Receipt, 
  Package, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Wallet, 
  Plus, 
  Eye, 
  RefreshCw, 
  AlertCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { admin } = useAuth();
  const navigate = useNavigate();

  const [vouchers, setVouchers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Currency Formatter Helper (Ks)
  const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString()} Ks`;

  // Fetch real data matching backend controllers
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vouchersRes, itemsRes] = await Promise.all([
        api.get('/api/admin/vouchers'),
        api.get('/api/admin/items')
      ]);

      // Normalize data matching VoucherController (vouchers) & ItemController (items)
      const voucherData = Array.isArray(vouchersRes.data) 
        ? vouchersRes.data 
        : vouchersRes.data?.vouchers || vouchersRes.data?.data || [];

      const itemData = Array.isArray(itemsRes.data) 
        ? itemsRes.data 
        : itemsRes.data?.items || itemsRes.data?.data || [];

      setVouchers(voucherData);
      setItems(itemData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.response?.data?.message || 'Unable to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate Metrics from Voucher Data
  const todayStr = new Date().toISOString().split('T')[0];

  const totalVouchersCount = vouchers.length;
  
  const todaysVouchersCount = vouchers.filter(v => {
    const createdDate = (v.created_at || v.date || '').split('T')[0];
    return createdDate === todayStr;
  }).length;

  const totalItemsCount = items.length;

  // Extract unique customer IDs or phones safely from nested customer object or top-level field
  const uniqueCustomersCount = new Set(
    vouchers.map(v => v.customer?.id || v.customer?.phone || v.customer_id || v.customer_phone).filter(Boolean)
  ).size;

  // Calculate Totals matching formatVoucher() keys (subtotal, total, prepaid_fee, remaining_amount)
  const totalSales = vouchers.reduce((acc, v) => acc + (Number(v.total || v.total_amount) || 0), 0);
  const totalPrepaid = vouchers.reduce((acc, v) => acc + (Number(v.prepaid_fee || v.prepaid_amount) || 0), 0);
  const totalRemaining = vouchers.reduce((acc, v) => acc + (Number(v.remaining_amount || (v.total - v.prepaid_fee)) || 0), 0);

  // Recent Vouchers (top 5 sorted by date/id descending)
  const recentVouchers = [...vouchers].slice(0, 5);

  return (
    <div className="space-y-8">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-brand-beige/60 shadow-card">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-charcoal tracking-tight">
            {getGreeting()}, <span className="text-brand-plum">{admin?.name || 'System Admin'}</span> 👋
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Here's what's happening with your pajama orders today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-3 bg-brand-cream hover:bg-brand-beige/50 text-brand-plum rounded-2xl border border-brand-beige/80 transition-all flex items-center justify-center disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/vouchers/create')}
            className="px-5 py-3 bg-brand-plum hover:bg-brand-plum-dark text-white text-sm font-semibold rounded-2xl shadow-md shadow-brand-plum/10 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Voucher</span>
          </button>
        </div>
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="text-xs font-semibold uppercase underline hover:text-rose-900"
          >
            Try Again
          </button>
        </div>
      )}

      {/* STATISTIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Vouchers */}
        <StatCard
          title="Total Vouchers"
          value={loading ? '...' : totalVouchersCount}
          subtitle="All time created"
          icon={Receipt}
          color="plum"
        />

        {/* Card 2: Today's Vouchers */}
        <StatCard
          title="Today's Vouchers"
          value={loading ? '...' : todaysVouchersCount}
          subtitle="Issued today"
          icon={Clock}
          color="rose"
        />

        {/* Card 3: Total Customers */}
        <StatCard
          title="Total Customers"
          value={loading ? '...' : uniqueCustomersCount}
          subtitle="Unique clients"
          icon={Users}
          color="plum"
        />

        {/* Card 4: Total Items */}
        <StatCard
          title="Inventory Items"
          value={loading ? '...' : totalItemsCount}
          subtitle="Available products"
          icon={Package}
          color="rose"
        />

      </div>

      {/* FINANCIAL SUMMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white p-6 rounded-2xl border border-brand-beige/60 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Total Sales</p>
            <p className="text-xl font-bold text-brand-charcoal mt-0.5">
              {loading ? '...' : formatCurrency(totalSales)}
            </p>
          </div>
        </div>

        <div className="bg-[#FFF9F5] p-6 rounded-2xl border border-brand-beige/60 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Total Prepaid</p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">
              {loading ? '...' : formatCurrency(totalPrepaid)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-beige/60 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Remaining Balance</p>
            <p className="text-xl font-bold text-rose-600 mt-0.5">
              {loading ? '...' : formatCurrency(totalRemaining)}
            </p>
          </div>
        </div>

      </div>

      {/* RECENT VOUCHERS TABLE SECTION */}
      <div className="bg-white rounded-3xl border border-brand-beige/60 shadow-card overflow-hidden">
        
        <div className="p-6 border-b border-brand-beige/40 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-brand-charcoal">Recent Vouchers</h3>
            <p className="text-xs text-brand-muted mt-0.5">Latest customer vouchers created in system</p>
          </div>

          <button
            onClick={() => navigate('/vouchers')}
            className="text-xs font-semibold text-brand-plum hover:text-brand-plum-dark flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* LOADING TABLE */}
        {loading ? (
          <div className="p-12 text-center text-brand-muted text-sm space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-rose" />
            <p>Fetching vouchers from server...</p>
          </div>
        ) : recentVouchers.length === 0 ? (
          /* EMPTY STATE */
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-cream border border-brand-beige/80 mx-auto flex items-center justify-center text-brand-rose">
              <Receipt className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-brand-charcoal">No vouchers yet</h4>
              <p className="text-xs text-brand-muted max-w-sm mx-auto mt-1">
                Create your first customer voucher to start digitizing pajama sales.
              </p>
            </div>
            <button
              onClick={() => navigate('/vouchers/create')}
              className="px-4 py-2.5 bg-brand-plum text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 hover:bg-brand-plum-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Voucher</span>
            </button>
          </div>
        ) : (
          /* VOUCHER TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-cream/60 border-b border-brand-beige/40 text-[11px] uppercase font-bold text-brand-muted tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Voucher ID</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Phone</th>
                  <th className="py-3.5 px-6">Total</th>
                  <th className="py-3.5 px-6">Prepaid</th>
                  <th className="py-3.5 px-6">Remaining</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige/30 text-brand-charcoal">
                {recentVouchers.map((voucher) => {
                  const id = voucher.id;
                  const name = voucher.customer?.name || voucher.customer_name || 'Guest';
                  const phone = voucher.customer?.phone || voucher.customer_phone || '-';
                  const total = Number(voucher.total || voucher.total_amount) || 0;
                  const prepaid = Number(voucher.prepaid_fee || voucher.prepaid_amount) || 0;
                  const remaining = Number(voucher.remaining_amount || (total - prepaid)) || 0;
                  const date = voucher.created_at
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
                        {date}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => navigate(`/vouchers/${id}`)}
                          className="p-2 hover:bg-brand-beige/40 rounded-xl text-brand-plum transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}

// Helper Reusable StatCard Component
function StatCard({ title, value, subtitle, icon: Icon, color = 'plum' }) {
  const isPlum = color === 'plum';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white p-6 rounded-3xl border border-brand-beige/60 shadow-card flex items-center justify-between"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">{title}</p>
        <p className="text-2xl font-bold text-brand-charcoal mt-1">{value}</p>
        <p className="text-[11px] text-brand-muted mt-0.5">{subtitle}</p>
      </div>

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
        isPlum 
          ? 'bg-brand-plum/10 text-brand-plum border border-brand-plum/20' 
          : 'bg-brand-rose/10 text-brand-rose border border-brand-rose/20'
      }`}>
        <Icon className="w-6 h-6" />
      </div>
    </motion.div>
  );
}