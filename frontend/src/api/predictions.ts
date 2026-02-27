import api from './client';

export const predictionsApi = {
  getMy: (gpId: string) => api.get(`/predictions/${gpId}`),
  save: (gpId: string, predictions: { type: string; value: string }[]) =>
    api.post(`/predictions/${gpId}`, { predictions }),
  getAll: (gpId: string) => api.get(`/predictions/${gpId}/all`),
  deleteUserPredictions: (gpId: string, userId: string) =>
    api.delete(`/predictions/${gpId}/user/${userId}`),
};

export const standingsApi = {
  getLeague: (leagueId: string) => api.get(`/standings/${leagueId}`),
  getGp: (leagueId: string, gpId: string) => api.get(`/standings/${leagueId}/${gpId}`),
};
