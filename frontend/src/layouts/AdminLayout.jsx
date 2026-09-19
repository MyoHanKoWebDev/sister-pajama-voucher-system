import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShoppingBag,
  User,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine header title based on route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard Overview';
      case '/vouchers':
        return 'Vouchers Management';
      case '/items':
        return 'Inventory Items';
      case '/customers':
        return 'Customer Directory';
      case '/settings':
        return 'System Settings';
      default:
        return 'Admin Portal';
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Vouchers', path: '/vouchers', icon: Receipt },
    { name: 'Items', path: '/items', icon: Package },
  ];

  const adminName = admin?.name || 'System Admin';
  const adminInitial = adminName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-brand-cream flex font-sans text-brand-charcoal">
      
      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-brand-charcoal/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-brand-plum text-white flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Sidebar Header / Logo */}
          <div className="p-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-rose/20 border border-brand-rose/30 flex items-center justify-center text-brand-rose">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight leading-tight text-white">
                  Sisters Pajama
                </h1>
                <span className="text-[10px] text-brand-rose-light uppercase tracking-wider font-semibold">
                  Admin Portal
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-bold text-brand-rose-light/60 uppercase tracking-wider">
              Main Menu
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-rose text-white shadow-sm font-semibold'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            <div className="pt-4 px-3 py-2 text-[10px] font-bold text-brand-rose-light/60 uppercase tracking-wider">
              System
            </div>

            <NavLink
              to="/settings"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-rose text-white shadow-sm font-semibold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAVBAR */}
        <header className="bg-white border-b border-brand-beige/60 sticky top-0 z-30 shadow-card">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            
            {/* Left: Hamburger & Page Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-brand-charcoal hover:bg-brand-cream rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-brand-charcoal tracking-tight">
                {getPageTitle()}
              </h2>
            </div>

            {/* Right: User Profile & Quick Actions */}
            <div className="flex items-center gap-3 relative">
              <div 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-brand-cream transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-brand-plum text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {adminInitial}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-brand-charcoal leading-none">
                    {adminName}
                  </p>
                  <p className="text-[10px] text-brand-muted mt-0.5">
                    {admin?.email || 'Administrator'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-brand-muted hidden sm:block" />
              </div>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <>
                  <div 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="fixed inset-0 z-10"
                  />
                  <div className="absolute right-0 top-12 w-48 bg-white border border-brand-beige/80 rounded-2xl shadow-soft p-2 z-20 space-y-1">
                    <div className="px-3 py-2 border-b border-brand-beige/50">
                      <p className="text-xs font-bold text-brand-charcoal">{adminName}</p>
                      <p className="text-[10px] text-brand-muted truncate">{admin?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* PAGE BODY */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}