import React, { useState, useEffect } from "react";
import {
  Edit,
  XCircle,
  Plus,
  Check,
  X,
  AlertCircle,
  User,
  Shield,
  Mail,
  Calendar,
} from "lucide-react";
import {
  userService,
  type Usuario,
  type CreateUsuarioData,
} from "../../services/user.service";

const UserManagement: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Usuario>>({});
  const [newPassword, setNewPassword] = useState<string>("");

  const [newUsuario, setNewUsuario] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "editor" as "admin" | "editor" | "viewer",
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await userService.obtenerUsuarios();
      setUsuarios(response);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar usuarios");
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const resetNewUsuario = () => {
    setNewUsuario({
      nombre: "",
      email: "",
      password: "",
      rol: "editor",
    });
  };

  const handleCreateUsuario = async () => {
    if (
      !newUsuario.nombre.trim() ||
      !newUsuario.email.trim() ||
      !newUsuario.password.trim()
    ) {
      setError("Todos los campos son requeridos");
      return;
    }

    try {
      const userData: CreateUsuarioData = {
        nombre: newUsuario.nombre.trim(),
        email: newUsuario.email.trim(),
        password: newUsuario.password,
        rol: newUsuario.rol,
      };

      const nuevoUsuario = await userService.crearUsuario(userData);
      setUsuarios((prev) => [...prev, nuevoUsuario]);
      resetNewUsuario();
      setShowAddForm(false);
      setSuccess("Usuario creado exitosamente");
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al crear usuario");
    }
  };

  const handleUpdateUsuario = async () => {
    if (!editingId || !editingData.nombre?.trim() || !editingData.email?.trim())
      return;

    try {
      // Actualizar datos del usuario
      const updatedUsuario = await userService.actualizarUsuario(
        editingId,
        editingData
      );

      // Si hay nueva contraseña, actualizarla por separado
      if (newPassword.trim()) {
        await userService.cambiarPassword(editingId, newPassword);
      }

      setUsuarios((prev) =>
        prev.map((user) => (user._id === editingId ? updatedUsuario : user))
      );

      setEditingId(null);
      setEditingData({});
      setNewPassword("");
      setSuccess("Usuario actualizado exitosamente");
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al actualizar usuario");
    }
  };

  const handleDeleteUsuario = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;

    try {
      await userService.eliminarUsuario(id);
      setUsuarios((prev) => prev.filter((user) => user._id !== id));
      setSuccess("Usuario eliminado exitosamente");
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al eliminar usuario");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-800 mt-1 underline"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">Éxito</p>
            <p className="text-sm text-green-700">{success}</p>
            <button
              onClick={() => setSuccess(null)}
              className="text-sm text-green-600 hover:text-green-800 mt-1 underline"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Gestión de Usuarios */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Gestión de Usuarios
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Usuario</span>
            </button>
          </div>

          {/* Formulario de nuevo usuario */}
          {showAddForm && (
            <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Nuevo Usuario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={newUsuario.nombre}
                    onChange={(e) =>
                      setNewUsuario((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre completo del usuario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUsuario.email}
                    onChange={(e) =>
                      setNewUsuario((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={newUsuario.password}
                    onChange={(e) =>
                      setNewUsuario((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contraseña del usuario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Rol
                  </label>
                  <select
                    value={newUsuario.rol}
                    onChange={(e) =>
                      setNewUsuario((prev) => ({
                        ...prev,
                        rol: e.target.value as "admin" | "editor" | "viewer",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="viewer">Visualizador</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={handleCreateUsuario}
                  disabled={
                    !newUsuario.nombre.trim() ||
                    !newUsuario.email.trim() ||
                    !newUsuario.password.trim()
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Crear</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetNewUsuario();
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          )}

          {/* Lista de usuarios */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="font-medium">{usuario.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        {usuario.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          usuario.rol === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : usuario.rol === "editor"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {usuario.rol === "admin"
                          ? "Administrador"
                          : usuario.rol === "editor"
                          ? "Editor"
                          : "Visualizador"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>
                            Creado: {formatDate(usuario.fechaCreacion)}
                          </span>
                        </div>
                        {usuario.ultimoAcceso && (
                          <div className="flex items-center text-xs">
                            <span>
                              Último: {formatDate(usuario.ultimoAcceso)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingId(usuario._id);
                            setEditingData(usuario);
                            setTimeout(() => {
                              window.scrollTo({
                                top: document.body.scrollHeight,
                                behavior: "smooth",
                              });
                            }, 100);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUsuario(usuario._id)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Formulario de edición */}
          {editingId && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Editar Usuario: {editingData.nombre}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={editingData.nombre || ""}
                    onChange={(e) =>
                      setEditingData((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre completo del usuario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingData.email || ""}
                    onChange={(e) =>
                      setEditingData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Rol
                  </label>
                  <select
                    value={editingData.rol || "editor"}
                    onChange={(e) =>
                      setEditingData((prev) => ({
                        ...prev,
                        rol: e.target.value as "admin" | "editor" | "viewer",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="viewer">Visualizador</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dejar vacío para no cambiar"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Solo completa este campo si quieres cambiar la contraseña
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={handleUpdateUsuario}
                  disabled={
                    !editingData.nombre?.trim() || !editingData.email?.trim()
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Guardar Cambios</span>
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditingData({});
                    setNewPassword("");
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          )}

          {usuarios.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay usuarios registrados</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                Crear primer usuario
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
