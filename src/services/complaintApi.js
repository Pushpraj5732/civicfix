import api from "./api";

export const createComplaint = (data) => {
  return api.post("/api/complaints", data);
};

export const uploadComplaintImage = (complaintId, formData) => {
  return api.post(`/api/complaints/${complaintId}/upload-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadAfterImage = (complaintId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "AFTER");

  return api.post(`/api/complaints/${complaintId}/upload-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getComplaintImages = (complaintId) => {
  return api.get(`/api/complaints/${complaintId}/images`);
};

export const getMyComplaints = () => {
  return api.get("/api/complaints/my");
};

export const getComplaints = (params) => {
  return api.get("/api/complaints", { params });
};

export const getComplaintById = (id) => {
  return api.get(`/api/complaints/${id}`);
};

export const updateComplaintStatus = (id, newStatus) => {
  return api.put(`/api/complaints/${id}/status`, { newStatus });
};
