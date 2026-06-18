// src/utils/api.js
import axios from "axios";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7821";

// Helper to get dbType from localStorage
const getDbType = () => localStorage.getItem("dbType");

// Wrapper for GET requests
export const apiGet = (url, params = {}) => {
  return axios.get(`${API_BASE_URL}${url}`, {
    params: {
      ...params,
      dbType: getDbType()
    }
  });
};

// Wrapper for POST requests
export const apiPost = (url, data = {}) => {
  return axios.post(`${API_BASE_URL}${url}`, {
    ...data,
    dbType: getDbType()
  });
};

// Wrapper for PUT requests
export const apiPut = (url, data = {}) => {
  return axios.put(`${API_BASE_URL}${url}`, {
    ...data,
    dbType: getDbType()
  });
};

// Wrapper for DELETE requests
export const apiDelete = (url, params = {}) => {
  return axios.delete(`${API_BASE_URL}${url}`, {
    params: {
      ...params,
      dbType: getDbType()
    }
  });
};

// Original axios export for custom requests
export { axios };