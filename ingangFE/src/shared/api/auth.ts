import { http } from './http';
import type { User } from '../../types/auth';

type ApiUser = {
  id: string;
  email: string;
  name: string;
  type: 'STUDENT' | 'INSTRUCTOR' | string;
  createdAt: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};

const mapUser = (u: ApiUser): User => ({
  id: u.id,
  email: u.email,
  name: u.name,
  type: u.type === 'INSTRUCTOR' ? 'instructor' : 'student',
  createdAt: u.createdAt,
});

export const register = async (data: {
  email: string;
  password: string;
  name: string;
  type: 'student' | 'instructor';
}): Promise<AuthResponse> => {
  const response = await http.post<{ user: ApiUser; accessToken: string }>('/auth/register', data);
  return { user: mapUser(response.data.user), accessToken: response.data.accessToken };
};

export const login = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await http.post<{ user: ApiUser; accessToken: string }>('/auth/login', data);
  return { user: mapUser(response.data.user), accessToken: response.data.accessToken };
};
