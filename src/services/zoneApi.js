import api from "./api";

export const getAdminStats = (params) => {
  return api.get("/api/admin/stats", { params });
};

export const getZoneStats = (params) => {
  return api.get("/api/admin/zone-stats", { params });
};

// Admin-only zone list (with head info)
export const getAdminZones = () => {
  return api.get("/api/admin/zones");
};

// PUBLIC zone list (no auth needed — for register/complaint forms)
export const getZones = () => {
  return api.get("/api/zones");
};

export const getMyZoneStats = (params) => {
  return api.get("/api/zone/my-stats", { params });
};

export const getZoneComplaints = (params) => {
  return api.get("/api/zone/complaints", { params });
};

export const updateZoneComplaintStatus = (id, newStatus) => {
  return api.put(`/api/zone/complaints/${id}/status`, { newStatus });
};
