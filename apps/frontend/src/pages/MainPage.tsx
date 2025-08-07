import { useState, type JSX } from "react";
import {
  Upload,
  History,
  Users,
  Settings as SettingsIcon,
  BarChart3,
} from "lucide-react";
import CargaMasiva from "@/components/CargaMasiva";
import Historial from "@/components/History";
import Community from "@/components/Community";
import Dashboard from "@/components/Dashboard";
import Settings from "@/components/Settings";
import type { User } from "@/services/auth.service";

type ActiveTab =
  | "dashboard"
  | "comunidad"
  | "cargaMasiva"
  | "historial"
  | "configuracion";

interface MainPageProps {
  onLogout: () => void;
  currentUser: User | null;
}

const MainPage = ({ onLogout, currentUser }: MainPageProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  //
  const tabs = [
    { id: "dashboard" as ActiveTab, label: "Dashboard", icon: BarChart3 },
    { id: "comunidad" as ActiveTab, label: "Comunidad", icon: Users },
    { id: "cargaMasiva" as ActiveTab, label: "Carga Masiva", icon: Upload },
    { id: "historial" as ActiveTab, label: "Historial", icon: History },
    {
      id: "configuracion" as ActiveTab,
      label: "Configuración",
      icon: SettingsIcon,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "comunidad":
        return <Community />;
      case "cargaMasiva":
        return <CargaMasiva />;
      case "historial":
        return <Historial />;
      case "configuracion":
        return <Settings userRole={currentUser?.rol || "viewer"} />;
      default:
        return <Community />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Sistema de Gestión Comunitaria
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Bienvenido, {currentUser?.email || "Usuario"}
              </span>
              <button
                onClick={onLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar Navigation */}
          <nav className="w-64 bg-white rounded-lg shadow-sm p-6">
            <ul className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {tabs.find((tab) => tab.id === activeTab)?.label}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {activeTab === "dashboard" &&
                      "Vista general del sistema y estadísticas"}
                    {activeTab === "comunidad" &&
                      "Gestiona los datos de la comunidad"}
                    {activeTab === "cargaMasiva" &&
                      "Carga masiva de datos desde archivos Excel o CSV"}
                    {activeTab === "historial" &&
                      "Revisa el historial de cambios y operaciones"}
                    {activeTab === "configuracion" &&
                      "Configuración del sistema y usuarios"}
                  </p>
                </div>

                <div className="overflow-hidden min-w-0">{renderContent()}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
