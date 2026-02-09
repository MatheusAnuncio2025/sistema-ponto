// Arquivo: frontend/src/services/api/auth.ts

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "hr" | "supervisor" | "coordinator" | "manager" | "employee";
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "hr" | "supervisor" | "coordinator" | "manager" | "employee";
}

// Criar instância do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Serviços de autenticação
export const authService = {
  /**
   * Faz login do usuário
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);

      // Salvar token no localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao fazer login");
    }
  },

  /**
   * Registra novo usuário
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/register", data);

      // Salvar token no localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Erro ao registrar usuário",
      );
    }
  },

  /**
   * Busca dados do usuário logado
   */
  async getMe(): Promise<User> {
    try {
      const response = await api.get<User>("/auth/me");
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Erro ao buscar dados do usuário",
      );
    }
  },

  /**
   * Faz logout do usuário
   */
  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },

  /**
   * Retorna usuário do localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Retorna token do localStorage
   */
  getToken(): string | null {
    return localStorage.getItem("token");
  },
};

export default api;
