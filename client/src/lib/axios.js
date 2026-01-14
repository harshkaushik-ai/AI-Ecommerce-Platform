import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "https://ecommerce-backend-ds9s.onrender.com/api/v1"
      : "https://ecommerce-backend-ds9s.onrender.com/api/v1",
  withCredentials: true,
});
