import api from "./api";

export const loginUser = (data) => {
  return api.post("/api/auth/login", data);
};

export const registerUser = (data) => {
  return api.post("/api/auth/register", data);
};

export const getMe = (token) => {
  return api.get("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
};
