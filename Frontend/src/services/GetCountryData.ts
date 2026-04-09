import axios from 'axios';

// Fallback values defined as constants
const DEFAULT_BASE_URL = 'https://localhost:7221';
const DEFAULT_TIMEOUT = 1000000;

const api = axios.create({
  // Use the env variable, or fall back to the default
  baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL,
  
  // Ensure timeout is a number, falling back if the env is missing or NaN
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || DEFAULT_TIMEOUT,
  
  headers: {
    'Content-Type': 'application/json',
  },
});

export default async function getCountry(name: string) {
    const response = await api.get(`/api/Countries/${name}`);
    return response.data;
}