import axios from "axios";

const api = axios.create({
  baseURL: "",
});

// Add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors — only redirect if user is supposed to be logged in
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPages = ["/login", "/register"];
      const isPublicPage = publicPages.includes(window.location.pathname);

      // Only redirect to login if we're NOT already on a public page
      if (!isPublicPage && localStorage.getItem("token")) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
