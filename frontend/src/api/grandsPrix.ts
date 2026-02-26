import api from './client';

export const grandsPrixApi = {
  getAll: () => api.get('/grands-prix'),
  getById: (id: string) => api.get(`/grands-prix/${id}`),
  getResults: (id: string) => api.get(`/grands-prix/${id}/results`),
  create: (data: object) => api.post('/grands-prix', data),
  update: (id: string, data: object) => api.put(`/grands-prix/${id}`, data),
  enterResults: (id: string, results: { type: string; value: string }[]) =>
    api.put(`/grands-prix/${id}/results`, { results }),
};
