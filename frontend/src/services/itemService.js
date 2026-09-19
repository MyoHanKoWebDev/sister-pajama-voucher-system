import api from './api';

export const getItems = async () => {
  const response = await api.get('/api/admin/items');
  return response.data;
};

export const getItem = async (id) => {
  const response = await api.get(`/api/admin/items/${id}`);
  return response.data;
};

export const createItem = async (data) => {
  const response = await api.post('/api/admin/items', data);
  return response.data;
};

export const updateItem = async (id, data) => {
  const response = await api.put(`/api/admin/items/${id}`, data);
  return response.data;
};

export const deleteItem = async (id) => {
  const response = await api.delete(`/api/admin/items/${id}`);
  return response.data;
};

const itemService = {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
};

export default itemService;