import api from './api';

export const getVouchers = async () => {
  const response = await api.get('/api/admin/vouchers');
  return response.data;
};

export const getVoucher = async (id) => {
  const response = await api.get(`/api/admin/vouchers/${id}`);
  return response.data;
};

export const createVoucher = async (data) => {
  const response = await api.post('/api/admin/vouchers', data);
  return response.data;
};

export const updateVoucher = async (id, data) => {
  const response = await api.put(`/api/admin/vouchers/${id}`, data);
  return response.data;
};

export const deleteVoucher = async (id) => {
  const response = await api.delete(`/api/admin/vouchers/${id}`);
  return response.data;
};

export const getDeliveryFees = async () => {
  const response = await api.get('/api/admin/delivery-fees');
  return response.data;
};