import axios from "axios";
import { store } from "@/redux/store"; // or wherever your Redux store is
import { setUser,  } from "@/redux/userSlice";
import router from "next/router";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8089",
  withCredentials: true, // important to send HttpOnly refresh token cookie
});

// Response interceptor to handle expired JWT
axiosInstance.interceptors.response.use(
  (response) => response, // success response
  async (error) => {
    const originalRequest = error.config;

    // If 401 and request has not been retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint
        const refreshRes = await axiosInstance.post("/auth/refresh");

        const newAccessToken = refreshRes.data.data.accessToken;

        // Update Redux store with new token
        store.dispatch(setUser({ 
          user: store.getState().user.user, 
          token: newAccessToken 
        }));

        // Update Authorization header for original request
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (err) {
        // Refresh token expired or invalid → logout
        // store.dispatch(logoutUser());
        router.push("/login");
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;