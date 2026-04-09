import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7221',
  timeout: 1000_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default async function getCountry(name: string)
{
    const response = await api.get(`/api/Countries/${name}`)
    return response.data // the json itself
}