import { useState, useEffect, type JSX } from "react";
import LoginPage from "./pages/Login";
import MainDashboard from "./pages/MainDashboard";
import AuthService, { type User } from "./services/auth.service";

function App(): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    AuthService.isAuthenticated()
  );
  const [currentUser, setCurrentUser] = useState<User | null>(
    AuthService.getCurrentUser()
  );
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  useEffect(() => {
    // Si hay un usuario en localStorage, establecer el estado
    if (currentUser) {
      setIsLoggedIn(true);
    }

    // Escuchar evento de sesión expirada
    const handleSessionExpired = (event: CustomEvent) => {
      console.log("Sesión expirada detectada:", event.detail);
      
      // Mostrar mensaje
      setSessionMessage(event.detail.message);
      
      // Hacer logout
      handleLogout();
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        setSessionMessage(null);
      }, 5000);
    };

    // Agregar listener
    window.addEventListener('sessionExpired', handleSessionExpired as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired as EventListener);
    };
  }, [currentUser]);

  const handleLogin = (email: string): void => {
    setIsLoggedIn(true);
    setSessionMessage(null); // Limpiar cualquier mensaje previo
    // Actualizar el usuario actual desde localStorage
    setCurrentUser(AuthService.getCurrentUser());
  };

  const handleLogout = (): void => {
    AuthService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  if (!isLoggedIn) {
    return (
      <div>
        {/* Mostrar mensaje de sesión si existe */}
        {sessionMessage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">{sessionMessage}</p>
              </div>
            </div>
          </div>
        )}
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  return <MainDashboard onLogout={handleLogout} currentUser={currentUser} />;
}

export default App;
