import { useState, type JSX } from "react";
import { Database, Users } from "lucide-react";
import DictionarySettings from "./settings/DictionarySettings";
import UserManagement from "./settings/UserManagement";

interface SettingsScreenProps {
  userRole: string;
}

const SettingsScreen = ({
  userRole,
}: SettingsScreenProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<"dictionary" | "users">(
    "dictionary"
  );

  const tabs = [
    {
      id: "dictionary" as const,
      label: "Diccionario de Columnas",
      icon: Database,
      description: "Configura las columnas y validaciones del sistema",
    },
    {
      id: "users" as const,
      label: "Gestión de Usuarios",
      icon: Users,
      description: "Administra usuarios y permisos del sistema",
      adminOnly: true,
    },
  ];

  // Filtrar tabs según el rol del usuario
  const availableTabs = tabs.filter(
    (tab) => !tab.adminOnly || userRole === "admin"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {availableTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon
                      className={`mr-2 h-5 w-5 ${
                        activeTab === tab.id
                          ? "text-blue-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Description */}
          <div className="mt-4">
            {availableTabs.map(
              (tab) =>
                activeTab === tab.id && (
                  <p key={tab.id} className="text-sm text-gray-600">
                    {tab.description}
                  </p>
                )
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "dictionary" && (
          <DictionarySettings userRole={userRole} />
        )}
        {activeTab === "users" && userRole === "admin" && <UserManagement />}
        {activeTab === "users" && userRole !== "admin" && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Acceso Restringido
            </h3>
            <p className="text-gray-600">
              No tienes permisos para acceder a la gestión de usuarios.
              <br />
              Esta sección está disponible solo para administradores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsScreen;
