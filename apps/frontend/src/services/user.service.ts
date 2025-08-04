import api from "./api";

export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  rol: "admin" | "editor" | "viewer";
  fechaCreacion: string;
  ultimoAcceso?: string;
}

export interface CreateUsuarioData {
  nombre: string;
  email: string;
  password: string;
  rol: "admin" | "editor" | "viewer";
}

export interface UpdateUsuarioData {
  nombre?: string;
  email?: string;
  rol?: "admin" | "editor" | "viewer";
  password?: string;
}

class UserService {
  private readonly baseUrl = "/users";

  async obtenerUsuarios(): Promise<Usuario[]> {
    try {
      const response = await api.get<Usuario[]>(this.baseUrl);
      return response.data;
    } catch (error: any) {
      console.error("Error al obtener usuarios:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Error al obtener usuarios"
      );
    }
  }

  async obtenerUsuarioPorId(id: string): Promise<Usuario> {
    try {
      const response = await api.get<Usuario>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error al obtener usuario:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Error al obtener usuario"
      );
    }
  }

  async crearUsuario(userData: CreateUsuarioData): Promise<Usuario> {
    try {
      const response = await api.post<Usuario>(this.baseUrl, userData);
      return response.data;
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Error al crear usuario"
      );
    }
  }

  async actualizarUsuario(
    id: string,
    userData: UpdateUsuarioData
  ): Promise<Usuario> {
    try {
      const response = await api.put<Usuario>(
        `${this.baseUrl}/${id}`,
        userData
      );
      return response.data;
    } catch (error: any) {
      console.error("Error al actualizar usuario:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Error al actualizar usuario"
      );
    }
  }

  async eliminarUsuario(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Error al eliminar usuario"
      );
    }
  }

  async cambiarPassword(id: string, password: string): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/${id}/password`, { password });
    } catch (error: any) {
      console.error("Error al cambiar contraseña:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Error al cambiar contraseña"
      );
    }
  }
}

export const userService = new UserService();
