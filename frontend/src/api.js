import axios from "axios";

console.log("👉 API Base URL in frontend:", import.meta.env.VITE_API_URL);

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ✅ must come from .env
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});
export const getWeeklyReport = () => API.get("/analytics/weekly-report");
export const suggestAssignee = (payload) => API.post("/tasks/suggest", payload);

export const register = (formData) => API.post("/auth/register", formData);
export const login = (formData) => API.post("/auth/login", formData);
export const updateUser = (id, updates) => API.patch(`/users/${id}`, updates);

export const createTask = (task) => API.post("/tasks", task);
export const getTasks = () => API.get("/tasks");
export const updateTask = (id, task) => API.put(`/tasks/${id}`, task);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const getTeam = () => API.get("/users");
export const getNotifications = () => API.get("/notifications");
export const markNotificationRead = (id) => API.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.patch("/notifications/read-all");
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

export default API;