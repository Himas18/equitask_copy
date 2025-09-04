import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";
console.log("👉 API Base URL in frontend:", baseURL);

const API = axios.create({ baseURL });

// Attach bearer token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

/** --- Named exports used by AuthProvider --- **/
export const apiClient = API;                // <-- add this
export const me = () => API.get("/auth/me"); // <-- add this

/** --- Your existing API calls --- **/
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

/** default export still works if other files use it */
export default API;
