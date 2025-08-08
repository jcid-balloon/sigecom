import React, { useState, useEffect } from "react";
import { Edit, XCircle, Plus, Check, X, AlertCircle, Info } from "lucide-react";
import { diccionarioColumnaService } from "../../services/diccionario-columna.service";
import type { DiccionarioColumna, TipoColumna } from "../../types/columnas";
import { InfoModal } from "../utils";

interface DictionarySettingsProps {
  userRole?: string;
}

const DictionarySettings: React.FC<DictionarySettingsProps> = ({
  userRole = "editor",
}) => {
  const [columnas, setColumnas] = useState<DiccionarioColumna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<DiccionarioColumna>>(
    {}
  );

  // Estado para el modal de información
  const [modalInfo, setModalInfo] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
    mousePosition?: { x: number; y: number };
  }>({
    isOpen: false,
    title: "",
    content: "",
    mousePosition: undefined,
  });

  // Referencia para el timeout del hover
  const hoverTimeoutRef = React.useRef<number | null>(null);

  const [newColumna, setNewColumna] = useState({
    nombre: "",
    tipo: "string" as TipoColumna,
    requerido: false,
    valorPorDefecto: "",
    descripcion: "",
    tipoValidacion: undefined as "lista" | "regex" | "rango" | undefined,
    validacion: "",
    longitudMaxima: undefined as number | undefined,
    longitudMinima: undefined as number | undefined,
    valorMinimo: undefined as number | undefined,
    valorMaximo: undefined as number | undefined,
    patron: "",
    placeholder: "",
  });

  useEffect(() => {
    cargarColumnas();
  }, []);

  // Cleanup del timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const cargarColumnas = async () => {
    setLoading(true);
    try {
      const response =
        await diccionarioColumnaService.obtenerColumnasParaFrontend();
      setColumnas(response);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar columnas");
      setColumnas([]);
    } finally {
      setLoading(false);
    }
  };

  const resetNewColumna = () => {
    setNewColumna({
      nombre: "",
      tipo: "string",
      requerido: false,
      valorPorDefecto: "",
      descripcion: "",
      tipoValidacion: undefined,
      validacion: "",
      longitudMaxima: undefined,
      longitudMinima: undefined,
      valorMinimo: undefined,
      valorMaximo: undefined,
      patron: "",
      placeholder: "",
    });
  };

  const handleCreateColumna = async () => {
    if (!newColumna.nombre.trim()) {
      setError("El nombre de la columna es requerido");
      return;
    }

    try {
      const dataToSend: Omit<DiccionarioColumna, "_id"> = {
        nombre: newColumna.nombre.trim(),
        tipo: newColumna.tipo,
        requerido: newColumna.requerido,
        valorPorDefecto: newColumna.valorPorDefecto || undefined,
        descripcion: newColumna.descripcion || undefined,
        tipoValidacion: newColumna.tipoValidacion,
        validacion: newColumna.validacion || undefined,
        longitudMaxima: newColumna.longitudMaxima,
        longitudMinima: newColumna.longitudMinima,
        valorMinimo: newColumna.valorMinimo,
        valorMaximo: newColumna.valorMaximo,
        patron: newColumna.patron || undefined,
        placeholder: newColumna.placeholder || undefined,
      };

      const nuevaColumna = await diccionarioColumnaService.crearColumna(
        dataToSend
      );
      setColumnas((prev) => [...prev, nuevaColumna]);
      resetNewColumna();
      setShowAddForm(false);
      setSuccess("Columna creada exitosamente");
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al crear columna");
    }
  };

  const handleUpdateColumna = async () => {
    if (!editingId || !editingData.nombre?.trim()) return;

    try {
      const updatedColumna = await diccionarioColumnaService.actualizarColumna(
        editingId,
        editingData
      );
      setColumnas((prev) =>
        prev.map((col) => (col._id === editingId ? updatedColumna : col))
      );
      setEditingId(null);
      setEditingData({});
      setSuccess("Columna actualizada exitosamente");
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al actualizar columna");
    }
  };

  const handleDeleteColumna = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta columna?")) return;

    try {
      await diccionarioColumnaService.eliminarColumna(id);
      setColumnas((prev) => prev.filter((col) => col._id !== id));
      setSuccess("Columna eliminada exitosamente");
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al eliminar columna");
    }
  };

  // Funciones para manejar el hover del tooltip
  const handleMouseEnter = (
    nombre: string,
    descripcion: string,
    event: React.MouseEvent
  ) => {
    // Limpiar cualquier timeout pendiente
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Capturar la posición del mouse
    const mousePosition = { x: event.clientX, y: event.clientY };

    // Mostrar el modal después de un pequeño delay
    hoverTimeoutRef.current = window.setTimeout(() => {
      setModalInfo({
        isOpen: true,
        title: `Descripción: ${nombre.toUpperCase()}`,
        content: descripcion,
        mousePosition,
      });
    }, 300); // 300ms de delay para evitar abrir accidentalmente
  };

  const handleMouseLeave = () => {
    // Limpiar el timeout si el mouse sale antes de que se abra
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // Cerrar el modal
    setModalInfo({
      isOpen: false,
      title: "",
      content: "",
      mousePosition: undefined,
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

      {/* Diccionario de Columnas */}
      <div className="bg-white rounded-xl shadow-md overflow-visible">
        <div className="p-6 overflow-visible">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Diccionario de Columnas
            </h2>
            {userRole === "admin" && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Nueva Columna</span>
              </button>
            )}
          </div>

          {/* Formulario de nueva columna */}
          {showAddForm && (
            <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Nueva Columna
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={newColumna.nombre}
                    onChange={(e) =>
                      setNewColumna((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre de la columna"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Tipo de Dato
                  </label>
                  <select
                    value={newColumna.tipo}
                    onChange={(e) =>
                      setNewColumna((prev) => ({
                        ...prev,
                        tipo: e.target.value as TipoColumna,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="string">Texto</option>
                    <option value="number">Número</option>
                    <option value="boolean">Verdadero/Falso</option>
                    <option value="date">Fecha</option>
                    <option value="email">Email</option>
                    <option value="url">URL</option>
                    <option value="phone">Teléfono</option>
                    <option value="select">Lista de opciones</option>
                    <option value="textarea">Texto largo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={newColumna.placeholder}
                    onChange={(e) =>
                      setNewColumna((prev) => ({
                        ...prev,
                        placeholder: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Texto de ayuda para el usuario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Valor por Defecto
                  </label>
                  <input
                    type="text"
                    value={newColumna.valorPorDefecto}
                    onChange={(e) =>
                      setNewColumna((prev) => ({
                        ...prev,
                        valorPorDefecto: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Valor opcional por defecto"
                  />
                </div>

                {/* Campos específicos por tipo */}
                {(newColumna.tipo === "string" ||
                  newColumna.tipo === "textarea") && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Longitud Mínima
                      </label>
                      <input
                        type="number"
                        value={newColumna.longitudMinima || ""}
                        onChange={(e) =>
                          setNewColumna((prev) => ({
                            ...prev,
                            longitudMinima: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Longitud mínima"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Longitud Máxima
                      </label>
                      <input
                        type="number"
                        value={newColumna.longitudMaxima || ""}
                        onChange={(e) =>
                          setNewColumna((prev) => ({
                            ...prev,
                            longitudMaxima: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Longitud máxima"
                      />
                    </div>
                  </>
                )}

                {newColumna.tipo === "number" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Valor Mínimo
                      </label>
                      <input
                        type="number"
                        value={newColumna.valorMinimo || ""}
                        onChange={(e) =>
                          setNewColumna((prev) => ({
                            ...prev,
                            valorMinimo: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Valor mínimo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Valor Máximo
                      </label>
                      <input
                        type="number"
                        value={newColumna.valorMaximo || ""}
                        onChange={(e) =>
                          setNewColumna((prev) => ({
                            ...prev,
                            valorMaximo: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Valor máximo"
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Validación Adicional
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={newColumna.tipoValidacion || ""}
                      onChange={(e) =>
                        setNewColumna((prev) => ({
                          ...prev,
                          tipoValidacion: e.target.value
                            ? (e.target.value as "lista" | "regex" | "rango")
                            : undefined,
                          validacion: e.target.value ? prev.validacion : "",
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sin validación adicional</option>
                      {newColumna.tipo === "select" && (
                        <option value="lista">Lista de opciones</option>
                      )}
                      <option value="regex">Patrón regex</option>
                      {newColumna.tipo === "number" && (
                        <option value="rango">Rango personalizado</option>
                      )}
                    </select>
                    <input
                      type="text"
                      value={newColumna.validacion}
                      onChange={(e) =>
                        setNewColumna((prev) => ({
                          ...prev,
                          validacion: e.target.value,
                        }))
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={
                        !newColumna.tipoValidacion
                          ? "Sin validación adicional"
                          : newColumna.tipoValidacion === "lista"
                          ? "Opción1, Opción2, Opción3"
                          : newColumna.tipoValidacion === "regex"
                          ? "^[a-zA-Z]+$"
                          : '{"min": 0, "max": 100}'
                      }
                      disabled={!newColumna.tipoValidacion}
                    />
                  </div>
                  {newColumna.tipoValidacion && (
                    <p className="text-xs text-gray-500 mt-1">
                      {newColumna.tipoValidacion === "lista" &&
                        "Formato: valor1, valor2, valor3"}
                      {newColumna.tipoValidacion === "regex" &&
                        "Formato: expresión regular (ej: ^[a-zA-Z]+$)"}
                      {newColumna.tipoValidacion === "rango" &&
                        'Formato: {"min": número, "max": número}'}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newColumna.descripcion}
                    onChange={(e) =>
                      setNewColumna((prev) => ({
                        ...prev,
                        descripcion: e.target.value,
                      }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción de la columna"
                  />
                </div>

                <div className="md:col-span-2 flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newColumna.requerido}
                      onChange={(e) =>
                        setNewColumna((prev) => ({
                          ...prev,
                          requerido: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Campo requerido
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={handleCreateColumna}
                  disabled={!newColumna.nombre.trim()}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Crear</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetNewColumna();
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          )}

          {/* Lista de columnas */}
          <div
            className="mt-8 overflow-x-auto"
            style={{ overflowY: "visible" }}
          >
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16 relative">
                    Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propiedades
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validación
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {columnas.map((columna) => (
                  <tr key={columna._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="font-medium">
                          {columna.nombre.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center relative">
                      {columna.descripcion ? (
                        <div
                          onMouseEnter={(e) =>
                            handleMouseEnter(
                              columna.nombre,
                              columna.descripcion || "",
                              e
                            )
                          }
                          onMouseLeave={handleMouseLeave}
                          className="inline-flex items-center justify-center"
                        >
                          <Info className="h-4 w-4 text-gray-400 hover:text-blue-600 cursor-help transition-colors" />
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {columna.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {columna.requerido ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Requerido
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            Opcional
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {columna.tipoValidacion && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          {columna.tipoValidacion}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingId(columna._id);
                            setEditingData(columna);
                            // Hacer scroll hacia abajo después de un pequeño delay para que el form aparezca
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
                        {userRole === "admin" && (
                          <button
                            onClick={() => handleDeleteColumna(columna._id)}
                            className="text-red-600 hover:text-red-700"
                            title="Eliminar"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
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
                Editar Columna: {editingData.nombre}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nombre
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
                    placeholder="Nombre de la columna"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Tipo de Dato
                  </label>
                  <select
                    value={editingData.tipo || "string"}
                    onChange={(e) =>
                      setEditingData((prev) => ({
                        ...prev,
                        tipo: e.target.value as TipoColumna,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="string">Texto</option>
                    <option value="number">Número</option>
                    <option value="boolean">Verdadero/Falso</option>
                    <option value="date">Fecha</option>
                    <option value="email">Email</option>
                    <option value="url">URL</option>
                    <option value="phone">Teléfono</option>
                    <option value="select">Lista de opciones</option>
                    <option value="textarea">Texto largo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={editingData.placeholder || ""}
                    onChange={(e) =>
                      setEditingData((prev) => ({
                        ...prev,
                        placeholder: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Texto de ayuda para el usuario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Valor por Defecto
                  </label>
                  <input
                    type="text"
                    value={editingData.valorPorDefecto || ""}
                    onChange={(e) =>
                      setEditingData((prev) => ({
                        ...prev,
                        valorPorDefecto: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Valor opcional por defecto"
                  />
                </div>

                {/* Campos específicos por tipo */}
                {(editingData.tipo === "string" ||
                  editingData.tipo === "textarea") && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Longitud Mínima
                      </label>
                      <input
                        type="number"
                        value={editingData.longitudMinima || ""}
                        onChange={(e) =>
                          setEditingData((prev) => ({
                            ...prev,
                            longitudMinima: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Longitud mínima"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Longitud Máxima
                      </label>
                      <input
                        type="number"
                        value={editingData.longitudMaxima || ""}
                        onChange={(e) =>
                          setEditingData((prev) => ({
                            ...prev,
                            longitudMaxima: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Longitud máxima"
                      />
                    </div>
                  </>
                )}

                {editingData.tipo === "number" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Valor Mínimo
                      </label>
                      <input
                        type="number"
                        value={editingData.valorMinimo || ""}
                        onChange={(e) =>
                          setEditingData((prev) => ({
                            ...prev,
                            valorMinimo: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Valor mínimo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Valor Máximo
                      </label>
                      <input
                        type="number"
                        value={editingData.valorMaximo || ""}
                        onChange={(e) =>
                          setEditingData((prev) => ({
                            ...prev,
                            valorMaximo: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Valor máximo"
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Validación Adicional
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={editingData.tipoValidacion || ""}
                      onChange={(e) =>
                        setEditingData((prev) => ({
                          ...prev,
                          tipoValidacion: e.target.value
                            ? (e.target.value as "lista" | "regex" | "rango")
                            : undefined,
                          validacion: e.target.value ? prev.validacion : "",
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sin validación adicional</option>
                      {editingData.tipo === "select" && (
                        <option value="lista">Lista de opciones</option>
                      )}
                      <option value="regex">Patrón regex</option>
                      {editingData.tipo === "number" && (
                        <option value="rango">Rango personalizado</option>
                      )}
                    </select>
                    <input
                      type="text"
                      value={editingData.validacion || ""}
                      onChange={(e) =>
                        setEditingData((prev) => ({
                          ...prev,
                          validacion: e.target.value,
                        }))
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={
                        !editingData.tipoValidacion
                          ? "Sin validación adicional"
                          : editingData.tipoValidacion === "lista"
                          ? '["Opción1", "Opción2", "Opción3"]'
                          : editingData.tipoValidacion === "regex"
                          ? "^[a-zA-Z]+$"
                          : '{"min": 0, "max": 100}'
                      }
                      disabled={!editingData.tipoValidacion}
                    />
                  </div>
                  {editingData.tipoValidacion && (
                    <p className="text-xs text-gray-500 mt-1">
                      {editingData.tipoValidacion === "lista" &&
                        "Formato: valor1, valor2, valor3"}
                      {editingData.tipoValidacion === "regex" &&
                        "Formato: expresión regular (ej: ^[a-zA-Z]+$)"}
                      {editingData.tipoValidacion === "rango" &&
                        'Formato: {"min": número, "max": número}'}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={editingData.descripcion || ""}
                    onChange={(e) =>
                      setEditingData((prev) => ({
                        ...prev,
                        descripcion: e.target.value,
                      }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción de la columna"
                  />
                </div>

                <div className="md:col-span-2 flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingData.requerido || false}
                      onChange={(e) =>
                        setEditingData((prev) => ({
                          ...prev,
                          requerido: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Campo requerido
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={handleUpdateColumna}
                  disabled={!editingData.nombre?.trim()}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Guardar Cambios</span>
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditingData({});
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          )}

          {columnas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay columnas configuradas</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                Crear primera columna
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de información */}
      <InfoModal
        isOpen={modalInfo.isOpen}
        onClose={() =>
          setModalInfo({
            isOpen: false,
            title: "",
            content: "",
            mousePosition: undefined,
          })
        }
        title={modalInfo.title}
        content={modalInfo.content}
        tooltipMode={true}
        mousePosition={modalInfo.mousePosition}
      />
    </div>
  );
};

export default DictionarySettings;
