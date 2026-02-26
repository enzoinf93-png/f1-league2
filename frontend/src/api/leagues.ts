import api from './client';

export const leaguesApi = {
  getMyLeagues: () => api.get('/leagues'),
  getAdminLeagues: () => api.get('/leagues/admin'),
  getById: (id: string) => api.get(`/leagues/${id}`),
  create: (name: string) => api.post('/leagues', { name }),
  refreshInvite: (id: string) => api.post(`/leagues/${id}/invite/refresh`),
  previewInvite: (code: string) => api.get(`/leagues/join/${code}`),
  joinLeague: (code: string) => api.post(`/leagues/join/${code}`),
  updateScoring: (id: string, config: Record<string, number>) =>
    api.put(`/leagues/${id}/scoring`, config),
};
