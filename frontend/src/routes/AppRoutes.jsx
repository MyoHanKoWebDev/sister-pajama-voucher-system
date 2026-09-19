import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import ItemsPage from '../pages/items/ItemsPage';

// Voucher Pages
import VouchersPage from '../pages/vouchers/VouchersPage';
import VoucherDetailPage from '../pages/vouchers/VoucherDetailPage';
import VoucherFormPage from '../pages/vouchers/VoucherFormPage';
import SettingsPage from '../pages/settings/SettingsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes inside Admin Shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/items" element={<ItemsPage />} />
          
          {/* Voucher Management Routes */}
         <Route path="/vouchers" element={<VouchersPage />} />
          <Route path="/vouchers/create" element={<VoucherFormPage />} />
          <Route path="/vouchers/:id" element={<VoucherDetailPage />} />
          <Route path="/vouchers/:id/edit" element={<VoucherFormPage />} />

          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}