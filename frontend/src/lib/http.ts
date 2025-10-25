import axios from 'axios'

// Axios instance with baseURL from env, defaulting to local backend
const baseURL = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:5001'

export const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
})

export default http
