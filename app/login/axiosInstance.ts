import axios from "axios";
import { store } from "@/redux/store";
import { setUser } from "@/redux/userSlice";
import router from "next/router";

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
  baseURL: "http://localhost:8089",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  // Correct way to get token in a non-component file:
  const token = store.getState().user.token; 
  
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
    // If your API expects token in body for POST/PUT
    if (config.method !== 'get' && config.data && typeof config.data === 'object') {
      config.data.token = token;
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    if (response?.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Use standard 'axios' here to avoid interceptor loops
          const refreshRes = await axios.post("http://localhost:8089/auth/refresh", {}, {
            withCredentials: true
          });

          const newAccessToken = refreshRes.data.data.accessToken;

          store.dispatch(setUser({
            user: store.getState().user.user,
            token: newAccessToken
          }));

          isRefreshing = false;
          onRefreshed(newAccessToken);

          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (err) {
          isRefreshing = false;
          router.push("/login");
          return Promise.reject(err);
        }
      }

      // Logic for subsequent 401s while refresh is in progress
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;