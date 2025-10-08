import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dummyjson.com';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  expiresInMins?: number;
}

export interface SignupData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        ...credentials,
        expiresInMins: credentials.expiresInMins || 60,
      });
      
      const user = response.data;
      
      // Store token in cookies
      Cookies.set('token', user.token, { expires: 1 }); // 1 day
      Cookies.set('refreshToken', user.refreshToken, { expires: 7 }); // 7 days
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async signup(data: SignupData): Promise<any> {
    try {
      // Note: DummyJSON doesn't have a real signup endpoint
      // In a real app, you'd create a new user here
      // For demo purposes, we'll just simulate it
      const response = await axios.post(`${API_URL}/users/add`, {
        ...data,
        age: 25,
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = Cookies.get('token');
      if (!token) return null;

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      return null;
    }
  },

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) return null;

      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken,
        expiresInMins: 60,
      });
      
      const { token } = response.data;
      Cookies.set('token', token, { expires: 1 });
      
      return token;
    } catch (error) {
      return null;
    }
  },

  logout(): void {
    Cookies.remove('token');
    Cookies.remove('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('staySignedIn');
    localStorage.removeItem('inactivityTimeout');
    window.location.href = '/login';
  },

  getToken(): string | undefined {
    return Cookies.get('token');
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('token');
  },
};
