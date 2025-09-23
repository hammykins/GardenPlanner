import apiClient from './apiClient';

export async function register(email: string): Promise<{ message: string }> {
  const res = await apiClient.post('/auth/register', { email });
  return res.data;
}

export async function login(username: string, password: string): Promise<{ message: string; token: string; username: string }> {
  const res = await apiClient.post('/auth/login', { username, password });
  return res.data;
}
