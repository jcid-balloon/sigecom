import React, { useState, type JSX } from "react";
import AuthService from "../services/auth.service";

interface LoginPageProps {
  onLogin: (email: string) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps): JSX.Element => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError("");
      const response = await AuthService.login(email, password);
      onLogin(email);
    } catch (err) {
      console.error("Error de login:", err);
      setError("Credenciales incorrectas. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <img
            src="https://balloonlatam.com/wp-content/uploads/2024/02/blt.png"
            alt="Logo Balloon Latam"
            className="mx-auto mb-6 h-12 w-auto"
          />
          <h2 className="text-2xl font-bold text-gray-700">
            Bienvenido a SIGECOM
          </h2>
          <p className="text-gray-500">Sistema de Gestión de Comunidad</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="tu@email.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="text-right">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
