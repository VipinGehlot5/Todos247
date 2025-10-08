import axios from 'axios';
import { authService } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dummyjson.com';

export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export interface TodosResponse {
  todos: Todo[];
  total: number;
  skip: number;
  limit: number;
}

export const todoService = {
  async getAllTodos(): Promise<TodosResponse> {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/todos`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch todos');
    }
  },

  async getUserTodos(userId: number): Promise<TodosResponse> {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/todos/user/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user todos');
    }
  },

  async getTodoById(id: number): Promise<Todo> {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/todos/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch todo');
    }
  },

  async createTodo(todo: string, userId: number): Promise<Todo> {
    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${API_URL}/todos/add`,
        {
          todo,
          completed: false,
          userId,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create todo');
    }
  },

  async updateTodo(id: number, updates: Partial<Todo>): Promise<Todo> {
    try {
      const token = authService.getToken();
      const response = await axios.put(
        `${API_URL}/todos/${id}`,
        updates,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update todo');
    }
  },

  async deleteTodo(id: number): Promise<Todo> {
    try {
      const token = authService.getToken();
      const response = await axios.delete(`${API_URL}/todos/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete todo');
    }
  },
};
