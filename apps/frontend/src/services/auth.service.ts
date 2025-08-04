import api from "./api";

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  };
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

const AuthService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr) as User;
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem("token") !== null;
  },

  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  // Método para obtener el usuario actual desde el servidor
  fetchCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ user: User }>("/auth/me");
    return response.data.user;
  },
};

export default AuthService;
