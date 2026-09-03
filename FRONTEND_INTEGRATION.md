# Wiring the EduTrack frontend to this backend

The frontend currently runs on mock data. Three steps switch it to the live API.

## 1. `.env` in the frontend project
```
VITE_API_URL=http://localhost:8000/api
```

## 2. Replace `src/lib/api.js` with the live axios client
```js
import axios from "axios";

export const TOKEN_KEY = "edutrack_token";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || "Something went wrong";
    if (status === 401 && !window.location.pathname.startsWith("/login")) {
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject({ status, message });
  }
);

export default api;
```
(`axios` is already a dependency in the frontend's package.json.)

## 3. Replace `src/lib/services.js` with the live version
```js
import api from "./api";

export const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

export const studentsApi = {
  list: (params) => api.get("/students", { params }),
  get: (id) => api.get(`/students/${id}`),
  create: (data) => api.post("/students", data),
  update: (id, data) => api.put(`/students/${id}`, data),
  remove: (id) => api.delete(`/students/${id}`),
  reorder: (updates) => api.patch("/students/reorder", { updates }),
};

export const lecturersApi = {
  list: (params) => api.get("/lecturers", { params }),
  get: (id) => api.get(`/lecturers/${id}`),
  create: (data) => api.post("/lecturers", data),
  update: (id, data) => api.put(`/lecturers/${id}`, data),
  remove: (id) => api.delete(`/lecturers/${id}`),
};

export const notesApi = {
  list: () => api.get("/notes"),
  create: (data) => api.post("/notes", data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  remove: (id) => api.delete(`/notes/${id}`),
};

export const assignmentsApi = {
  list: () => api.get("/assignments"),
  create: (data) => api.post("/assignments", data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  remove: (id) => api.delete(`/assignments/${id}`),
};

export const aiApi = {
  status: () => api.get("/ai/status"),
  studentSummary: (data) => api.post("/ai/student-summary", data),
  generateEmail: (data) => api.post("/ai/generate-email", data),
  salesInsights: (data) => api.post("/ai/insights", data),
};

export const analyticsApi = {
  overview: () => api.get("/analytics/overview"),
};
```

The response shapes (`{ success, students }`, `{ success, student }`,
`{ success, stats, board, trend, recentStudents }`, …) match exactly what the
pages already consume, so no component changes are needed. Delete
`src/lib/mockData.js` once you're live.
