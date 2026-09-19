import api from './api';

export const updateAdminProfile = async (profileData) => {
  const response = await api.put('/api/admin/profile', profileData);
  return response.data;
};