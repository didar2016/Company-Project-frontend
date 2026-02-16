import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { toast } from '@/hooks/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ success: boolean; message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('website-storage');
        
        toast({
          variant: 'destructive',
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again.',
        });

        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
        return Promise.reject(refreshError);
      }
    }

    const message = error.response?.data?.message || 'An unexpected error occurred';
    
    if (error.response?.status === 403) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: message,
      });
    } else if (error.response?.status === 404) {
      toast({
        variant: 'destructive',
        title: 'Not Found',
        description: message,
      });
    } else if (error.response?.status === 400) {
      toast({
        variant: 'destructive',
        title: 'Invalid Request',
        description: message,
      });
    } else if (error.response?.status && error.response.status >= 500) {
      toast({
        variant: 'destructive',
        title: 'Server Error',
        description: 'Something went wrong. Please try again later.',
      });
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string, name: string, role?: string) =>
    api.post('/auth/register', { email, password, name, role }),
  
  logout: () => api.post('/auth/logout'),
  
  getMe: () => api.get('/auth/me'),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Website API (includes rooms and hero sections as sub-resources)
export const websiteApi = {
  getAll: () => api.get('/websites'),
  getById: (id: string) => api.get(`/websites/${id}`),
  create: (data: any) => api.post('/websites', data),
  update: (id: string, data: any) => api.put(`/websites/${id}`, data),
  delete: (id: string) => api.delete(`/websites/${id}`),
  switch: (id: string) => api.post(`/websites/${id}/switch`),
  assignAdmin: (id: string, adminId: string | null) => 
    api.patch(`/websites/${id}/assign-admin`, { adminId }),

  // Rooms (embedded in website)
  getRooms: (websiteId: string) =>
    api.get(`/websites/${websiteId}/rooms`),
  addRoom: (websiteId: string, data: any) =>
    api.post(`/websites/${websiteId}/rooms`, data),
  updateRoom: (websiteId: string, roomId: string, data: any) =>
    api.put(`/websites/${websiteId}/rooms/${roomId}`, data),
  deleteRoom: (websiteId: string, roomId: string) =>
    api.delete(`/websites/${websiteId}/rooms/${roomId}`),

  // Hero Sections (embedded in website)
  getHeroSections: (websiteId: string) =>
    api.get(`/websites/${websiteId}/hero-sections`),
  upsertHeroSection: (websiteId: string, data: any) =>
    api.post(`/websites/${websiteId}/hero-sections`, data),
  deleteHeroSection: (websiteId: string, heroId: string) =>
    api.delete(`/websites/${websiteId}/hero-sections/${heroId}`),

  // Site Settings (logo, footer)
  getSiteSettings: (websiteId: string) =>
    api.get(`/websites/${websiteId}/site-settings`),
  updateSiteSettings: (websiteId: string, data: any) =>
    api.put(`/websites/${websiteId}/site-settings`, data),

  // Our Story (single embedded object in website)
  getOurStory: (websiteId: string) =>
    api.get(`/websites/${websiteId}/our-story`),
  updateOurStory: (websiteId: string, data: any) =>
    api.put(`/websites/${websiteId}/our-story`, data),

  // Facilities (embedded in website)
  getFacilities: (websiteId: string) =>
    api.get(`/websites/${websiteId}/facilities`),
  addFacility: (websiteId: string, data: any) =>
    api.post(`/websites/${websiteId}/facilities`, data),
  updateFacility: (websiteId: string, facilityId: string, data: any) =>
    api.put(`/websites/${websiteId}/facilities/${facilityId}`, data),
  deleteFacility: (websiteId: string, facilityId: string) =>
    api.delete(`/websites/${websiteId}/facilities/${facilityId}`),

  // Reviews (embedded in website)
  getReviews: (websiteId: string) =>
    api.get(`/websites/${websiteId}/reviews`),
  addReview: (websiteId: string, data: any) =>
    api.post(`/websites/${websiteId}/reviews`, data),
  updateReview: (websiteId: string, reviewId: string, data: any) =>
    api.put(`/websites/${websiteId}/reviews/${reviewId}`, data),
  deleteReview: (websiteId: string, reviewId: string) =>
    api.delete(`/websites/${websiteId}/reviews/${reviewId}`),
};

// User API
export const userApi = {
  getAll: (role?: string, isActive?: boolean, search?: string) =>
    api.get('/users', { params: { role, isActive, search } }),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  updatePermissions: (id: string, data: any) =>
    api.patch(`/users/${id}/permissions`, data),
  toggleStatus: (id: string) => api.patch(`/users/${id}/toggle-status`),
};

// Upload API
export const uploadApi = {
  uploadImage: (formData: FormData) =>
    api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadMultiple: (formData: FormData) =>
    api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadGallery: (formData: FormData) =>
    api.post('/upload/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (filename: string, websiteId?: string) =>
    api.delete(`/upload/${filename}`, { params: { websiteId } }),
  listImages: (websiteId: string) => api.get(`/upload/list/${websiteId}`),
};

// Public API (no authentication required - for external websites)
export const publicApi = {
  getWebsiteByUniqueId: (uniqueId: string) =>
    api.get(`/public/website/${uniqueId}`),
};
