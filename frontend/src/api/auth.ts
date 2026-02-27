import api from './client';

export const authApi = {
  register: (data: { email: string; password: string; username: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
  deleteAccount: (data: { password: string }) =>
    api.delete('/auth/delete-account', { data }),
};
