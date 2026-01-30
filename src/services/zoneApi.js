import axios from "./api";

export const updateComplaintStatus = (id, newStatus) => {
  return axios.put(
    `/zone/complaints/${id}/status`,
    { newStatus }
  );
};
