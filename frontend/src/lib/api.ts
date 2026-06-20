import axios from "axios";
import { useAuthStore } from "@/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          useAuthStore.getState().setTokens(access, refreshToken);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post("/auth/register/", data),
  login: (data: any) => api.post("/auth/login/", data),
  sendOtp: (phone: string) => api.post("/auth/send_otp/", { phone }),
  verifyOtp: (phone: string, otp: string) => api.post("/auth/verify_otp/", { phone, otp }),
  resetPassword: (phone: string, otp: string, password: string) =>
    api.post("/auth/reset_password/", { phone, otp, password }),
  logout: (refresh: string) => api.post("/auth/logout/", { refresh }),
  refreshToken: (refresh: string) => api.post("/auth/refresh_token/", { refresh }),
  getProfile: () => api.get("/users/me/"),
  updateProfile: (data: any) => api.patch("/users/me/", data),
  updateDeviceToken: (data: any) => api.patch("/users/device_token/", data),
};

export const categoriesAPI = {
  getAll: () => api.get("/categories/"),
  getTree: () => api.get("/categories/tree/"),
  getFeatured: () => api.get("/categories/featured/"),
  getServices: (id: string) => api.get(`/categories/${id}/services/`),
};

export const mastersAPI = {
  getNearby: (params: { lat: number; lng: number; radius?: number; category?: string }) =>
    api.get("/masters/nearby/", { params }),
  getById: (id: string) => api.get(`/masters/${id}/`),
  getFavorites: () => api.get("/favorites/"),
  addFavorite: (masterId: string) => api.post("/favorites/", { master: masterId }),
  removeFavorite: (id: string) => api.delete(`/favorites/${id}/`),
};

export const ordersAPI = {
  create: (data: any) => api.post("/orders/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  getMyOrders: () => api.get("/orders/my_orders/"),
  getActiveOrders: () => api.get("/orders/active/"),
  getById: (id: string) => api.get(`/orders/${id}/`),
  makeOffer: (id: string, data: any) => api.post(`/orders/${id}/make_offer/`, data),
  acceptOffer: (id: string, offerId: string) => api.post(`/orders/${id}/accept_offer/`, { offer_id: offerId }),
  startWork: (id: string) => api.post(`/orders/${id}/start_work/`),
  completeWork: (id: string) => api.post(`/orders/${id}/complete_work/`),
  confirmCompletion: (id: string) => api.post(`/orders/${id}/confirm_completion/`),
  cancel: (id: string, reason?: string) => api.post(`/orders/${id}/cancel/`, { reason }),
  track: (id: string) => api.get(`/orders/${id}/track/`),
};

export const paymentsAPI = {
  getPayments: () => api.get("/payments/"),
  pay: (id: string, data: any) => api.post(`/payments/${id}/pay/`, data),
  release: (id: string) => api.post(`/payments/${id}/release/`),
  refund: (id: string) => api.post(`/payments/${id}/refund/`),
  dispute: (id: string, reason: string) => api.post(`/payments/${id}/dispute/`, { reason }),
};

export const reviewsAPI = {
  create: (data: any) => api.post("/reviews/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  getMyReviews: () => api.get("/reviews/my_reviews/"),
  getForMaster: (masterId: string) => api.get(`/reviews/for_master/`, { params: { master_id: masterId } }),
  report: (id: string, reason: string) => api.post(`/reviews/${id}/report/`, { reason }),
};

export const chatAPI = {
  getRooms: () => api.get("/chat/rooms/"),
  getOrCreate: (userId: string, orderId?: string) =>
    api.get("/chat/rooms/get_or_create/", { params: { user_id: userId, order_id: orderId } }),
  getMessages: (roomId: string, params?: any) =>
    api.get(`/chat/rooms/${roomId}/messages/`, { params }),
  sendMessage: (roomId: string, data: any) =>
    api.post(`/chat/rooms/${roomId}/send/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  markRead: (roomId: string) => api.post(`/chat/rooms/${roomId}/mark_read/`),
};

export const notificationsAPI = {
  getNotifications: () => api.get("/notifications/"),
  markRead: (id: string) => api.post(`/notifications/${id}/mark_read/`),
  markAllRead: () => api.post("/notifications/mark_all_read/"),
  unreadCount: () => api.get("/notifications/unread_count/"),
};

export const walletAPI = {
  getBalance: () => api.get("/wallets/balance/"),
  getTransactions: () => api.get("/wallets/transactions/"),
};

export const analyticsAPI = {
  getDashboard: () => api.get("/analytics/dashboard/"),
  getSummary: () => api.get("/analytics/summary/"),
  getUserGrowth: (days?: number) => api.get("/analytics/user_growth/", { params: { days } }),
  getRevenueChart: (months?: number) => api.get("/analytics/revenue_chart/", { params: { months } }),
  getTopCategories: () => api.get("/analytics/top_categories/"),
  getMasterStats: () => api.get("/analytics/master_stats/"),
};

export const settingsAPI = {
  getSettings: () => api.get("/settings/"),
  updateSettings: (data: any) => api.patch("/settings/", data),
};

export const aiAPI = {
  analyze: (text: string) => api.post("/ai/analyze/", { text }),
  estimatePrice: (text: string, categoryId?: string) =>
    api.post("/ai/estimate_price/", { text, category_id: categoryId }),
  detectFraud: (targetType: string, targetId: string) =>
    api.post("/ai/detect_fraud/", { target_type: targetType, target_id: targetId }),
  getRecommendations: (limit?: number) =>
    api.get("/ai/recommendations/", { params: { limit } }),
  chat: (message: string, sessionId?: string) =>
    api.post("/ai/chat/", { message, session_id: sessionId }),
};
