import axios from "axios";

const API_URL = import.meta.env.API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para añadir el token a las peticiones
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
  }
);

// Interceptor para manejar respuestas y errores de autenticación
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, simplemente la devolvemos
    return response;
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("Sesión expirada o sin permisos, cerrando sesión...");
      
      // Limpiar datos de sesión
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Emitir evento personalizado para que App.tsx maneje el logout
      const logoutEvent = new CustomEvent('sessionExpired', {
        detail: {
          reason: error.response?.status === 401 ? 'expired' : 'forbidden',
          message: error.response?.status === 401 
            ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
            : 'No tienes permisos para acceder a esta sección.'
        }
      });
      window.dispatchEvent(logoutEvent);
    }
    
    return Promise.reject(error);
  }
);

export default api;
