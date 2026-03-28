import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("stylohub_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("stylohub_token");
      localStorage.removeItem("stylohub_user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ────────────────────────────────────────────────────
export const authApi = {
  register: (body: { email: string; password: string; username: string }) =>
    api.post("/api/auth/register", body),
  login: (body: { email: string; password: string }) =>
    api.post("/api/auth/login", body),
  forgotPassword: (email: string) =>
    api.post("/api/auth/forgot-password", { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post("/api/auth/reset-password", { token, newPassword }),
};

// ── Creator Profile ─────────────────────────────────────────
export const creatorApi = {
  getProfile: () => api.get("/api/creator/profile"),
  updateTheme: (body: object) => api.put("/api/creator/profile/theme", body),
  addWidget: (body: object) => api.post("/api/creator/profile/widgets", body),
  updateWidget: (widgetId: string, body: object) =>
    api.put(`/api/creator/profile/widgets/${widgetId}`, body),
  deleteWidget: (widgetId: string) =>
    api.delete(`/api/creator/profile/widgets/${widgetId}`),
  toggleWidgetVisibility: (widgetId: string) =>
    api.patch(`/api/creator/profile/widgets/${widgetId}/visibility`),
  reorderWidgets: (orderedWidgetIds: string[]) =>
    api.put("/api/creator/profile/widgets/reorder", { orderedWidgetIds }),
  uploadImage: (file: File, folder: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    return api.post("/api/creator/profile/images", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getAnalytics: () => api.get("/api/creator/analytics"),
  createCheckout: () => api.post("/api/creator/subscription/checkout"),
  getLeads: () => api.get("/api/creator/profile/leads"),
  deleteLead: (leadId: string) => api.delete(`/api/creator/profile/leads/${leadId}`),
  updateAvatar: (url: string) => api.patch("/api/creator/profile/avatar", { url }),
  updateProfileInfo: (body: { displayName: string; bio?: string }) =>
    api.patch("/api/creator/profile/info", body),
  updateSeo: (body: { seoTitle?: string; seoDescription?: string }) =>
    api.patch("/api/creator/profile/seo", body),
};

// ── Public Profile ───────────────────────────────────────────
export const publicApi = {
  getProfile: (username: string) => api.get(`/api/p/${username}`),
  trackClick: (username: string, widgetId: string) =>
    api.post(`/api/p/${username}/widgets/${widgetId}/click`),
  submitLead: (username: string, widgetId: string, fields: Record<string, string>) =>
    api.post(`/api/p/${username}/leads`, { widgetId, fields }),
};
