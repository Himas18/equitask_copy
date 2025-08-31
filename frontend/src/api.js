import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000" });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const register = (formData) => API.post("/auth/register", formData);
export const login = (formData) => API.post("/auth/login", formData);

export const createTask = (task) => API.post("/tasks", task);
export const getTasks = () => API.get("/tasks");
export const updateTask = (id, task) => API.put(`/tasks/${id}`, task);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
