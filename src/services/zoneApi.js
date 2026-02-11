import api from "./api";

export const getAdminStats = (range) => {
  return api.get("/api/admin/stats", { params: { range } });
};

export const getZoneStats = (range) => {
  return api.get("/api/admin/zone-stats", { params: { range } });
};

export const getZones = () => {
  return api.get("/api/admin/zones");
};

export const getMyZoneStats = (range) => {
  return api.get("/api/zone/my-stats", { params: { range } });
};

export const getZoneComplaints = (params) => {
  return api.get("/api/zone/complaints", { params });
};

export const updateZoneComplaintStatus = (id, newStatus) => {
  return api.put(`/api/zone/complaints/${id}/status`, { newStatus });
};
