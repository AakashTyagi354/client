import axios from "axios";
import { store } from "@/redux/store";
import { clearUser, setUser } from "@/redux/userSlice";
import { clearDoctor } from "@/redux/doctorSlice";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8089",
  withCredentials: true,
});

// ── Request interceptor — attach JWT token ─────────────────────────────────
axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().user.token;

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

// ── Response interceptor ───────────────────────────────────────────────────
axiosInstance.interceptors.response.use(

  // ── Success handler — read rate limit headers ────────────────────────────
  (response) => {
    const remaining = response.headers['x-ratelimit-remaining'];
    const url = response.config.url || '';

    // Warn user when running low on AI requests
    // Gateway adds X-RateLimit-Remaining header on every response
    if (remaining !== undefined && parseInt(remaining) <= 2 && url.includes('/ai/')) {
      import('@/components/ui/use-toast').then(({ toast }) => {
        toast({
          variant: 'destructive',
          description: `Only ${remaining} AI request(s) remaining this minute`,
        });
      });
    }

    return response;
  },

  // ── Error handler ────────────────────────────────────────────────────────
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    // ── 429 Too Many Requests ──────────────────────────────────────────────
    // Handle BEFORE 401 — specific cases first, generic cases last
    // Same principle as route ordering in yml
    if (response?.status === 429) {
      const retryAfter = response.data?.retryAfter || 60;
      const message = response.data?.message ||
        `Too many requests. Try again in ${retryAfter} seconds.`;

      // Dynamic import — axiosInstance is not a React component
      // Cannot use useToast() hook here — no hook context
      // Dynamic import gets toast function directly without hooks
      import('@/components/ui/use-toast').then(({ toast }) => {
        toast({
          variant: 'destructive',
          title: 'Rate limit reached',
          description: message,
        });
      });

      // Never auto-retry 429s
      // Retrying immediately would just get another 429
      return Promise.reject(error);
    }

    // ── 401 Unauthorized — token refresh logic ─────────────────────────────
    if (response?.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Use standard axios here — NOT axiosInstance
          // Using axiosInstance would trigger this interceptor again
          // causing an infinite loop
          const refreshRes = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8089'}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          const newAccessToken = refreshRes.data.data.accessToken;

          store.dispatch(setUser({
            user: store.getState().user.user,
            token: newAccessToken,
          }));

          isRefreshing = false;
          onRefreshed(newAccessToken);

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);

        } catch (err) {
          isRefreshing = false;
          refreshSubscribers = [];
          store.dispatch(clearUser());
          store.dispatch(clearDoctor());
          window.location.replace('/login');
          return Promise.reject(err);
        }
      }

      // Subsequent 401s while refresh is in progress
      // Queue them and replay once new token arrives
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;