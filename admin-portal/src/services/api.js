import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_URL || 'https://vitalflow-api-6ile.onrender.com';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getTypes: () => api.get('/users/types'),
  getStatuses: () => api.get('/users/statuses'),
};

export const patientsAPI = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  getClinicians: () => api.get('/patients/clinicians/list'),

  create: (data) => api.post('/patients', data),  // ✅ ADD THIS
  update: (id, data) => api.put(`/patients/${id}`, data),  // ✅ ADD THIS

  createAttributes: (id, data) => api.post(`/patients/${id}/attributes`, data),
  updateAttributes: (id, data) => api.put(`/patients/${id}/attributes`, data),
  getPrescriptions: (id) => api.get(`/patients/${id}/prescriptions`),
  createPrescription: (id, data) =>
    api.post(`/patients/${id}/prescriptions`, data),
  getGroups: () => api.get('/patients/groups'),
  createGroup: (data) => api.post('/patients/groups', data),
  exists: (params) => api.get('/patients/exists', { params }),
  verify: (data) => api.post('/patients/verify', data),
  dailyReminder: () => api.get('/patients/daily-reminder'),
};

export const cliniciansAPI = {
  create: (data) => api.post('/clinicians', data),  // ✅ ADD THIS
  update: (id, data) => api.put(`/clinicians/${id}`, data),
  getAll: (params) => api.get('/clinicians', { params }),
  getById: (id) => api.get(`/clinicians/${id}`),
  getOverview: () => api.get('/clinicians/overview'),
  getPatients: (id) => api.get(`/clinicians/${id}/patients`),
  assignPatient: (id, data) => api.post(`/clinicians/${id}/patients`, data),
  unassignPatient: (id, patientId) =>
    api.delete(`/clinicians/${id}/patients/${patientId}`),
  resetPassword: (data) => api.post('/clinicians/reset-password', data),
};

export const dashboardAPI = {
  getSystemStats: () => api.get('/dashboard/system'),
  getClinicianDashboard: () => api.get('/dashboard/clinician'),
  getPatientStats: (id) => api.get(`/dashboard/patient/${id}`),
};

export const devicesAPI = {
  getAll: (params) => api.get('/devices', { params }),
  getById: (id) => api.get(`/devices/${id}`),
  create: (data) => api.post('/devices', data),
  update: (id, data) => api.put(`/devices/${id}`, data),
  assign: (id, data) => api.post(`/devices/${id}/assign`, data),
  getReadings: (id) => api.get(`/devices/${id}/readings`),
};

export const notificationsAPI = {
  getTokens: (params) => api.get('/notifications/tokens', { params }),
  registerToken: (data) => api.post('/notifications/tokens', data),
  unregisterToken: (id) => api.delete(`/notifications/tokens/${id}`),
  send: (data) => api.post('/notifications/send', data),
  broadcast: (data) => api.post('/notifications/broadcast', data),
};

export const accountsAPI = {
  getAll: () => api.get('/accounts'),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  getAttributes: (id) => api.get(`/accounts/${id}/attributes`),
  getStats: (id) => api.get(`/accounts/${id}/stats`),
};

export const spirometryAPI = {
  getByUser: (userId, params) =>
    api.get(`/spirometry/user/${userId}`, { params }),
  getLatest: () => api.get('/spirometry/latest'),
  getReportPDF: (observationId) =>
    api.get(`/spirometry/observation/${observationId}/pdf`, {
      responseType: "blob",
    }),
  getAll: (params) => api.get('/spirometry/all', { params }),
  sync: (data) => api.post('/user_observations/sync_plus', data),
  getObservations: (params) => api.get('/user_observations', { params }),
  getDays: (userId) => api.get(`/days_of_spirometry/${userId}`),
  getReadings: () => api.get('/spirometry_readings'),
};

export const healthAPI = {
  getHeartRate: (params) => api.get('/heart_rate_observations', { params }),
  syncHeartRate: (data) => api.post('/heart_rate_observations/sync', data),
  getSteps: (params) => api.get('/steps_observations', { params }),
  syncSteps: (data) => api.post('/steps_observations/sync', data),
};

export const alertsAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  create: (data) => api.post('/alerts', data),
  notify: (userId, data) => api.post(`/notify/${userId}`, data),
  getTrends: (userId) => api.get(`/trends/alerts/${userId}`),
};

export const trendsAPI = {
  getSpirometry: (userId, start, end) =>
    api.get(`/trends/spirometry/${userId}/${start}/${end}`),
  getIAQ: (userId, start, end) =>
    api.get(`/trends/iaq/${userId}/${start}/${end}`),
  getAQI: (userId, start, end) =>
    api.get(`/trends/aqi/${userId}/${start}/${end}`),
};

export const predictedAPI = {
  getByUser: (userId) => api.get(`/predicted/${userId}`),
  create: (data) => api.post('/predicted', data),
};
// Add this alongside your existing patientsAPI/dashboardAPI in services/api.js.
// Assumes the same shared `api` axios instance those use.

export const rolesAPI = {
  // Roles (dc_user_type)
  listRoles() {
    return api.get("/roles");
  },
  createRole(name) {
    return api.post("/roles", { name });
  },
  updateRole(id, name) {
    return api.put(`/roles/${id}`, { name });
  },
  deleteRole(id) {
    return api.delete(`/roles/${id}`);
  },

  // Modules (dc_modules)
  listModules() {
    return api.get("/modules");
  },
  createModule(name) {
    return api.post("/modules", { name });
  },
  updateModule(id, name) {
    return api.put(`/modules/${id}`, { name });
  },
  deleteModule(id) {
    return api.delete(`/modules/${id}`);
  },

  // Permissions (dc_module_roles)
  getRolePermissions(roleId) {
    return api.get(`/roles/${roleId}/permissions`);
  },
  setRolePermissions(roleId, permissions) {
    return api.put(`/roles/${roleId}/permissions`, { permissions });
  },
  getPermissionsMatrix() {
    return api.get("/permissions/matrix");
  },
  setPermissionCell(roleId, moduleId, { isView, isWriteable }) {
    return api.put(`/permissions/${roleId}/${moduleId}`, { isView, isWriteable });
  },

  // User <-> role assignment
  getUserRole(userId) {
    return api.get(`/users/${userId}/role`);
  },
  setUserRole(userId, roleId) {
    return api.patch(`/users/${userId}/role`, { roleId });
  },
};

export default api;
