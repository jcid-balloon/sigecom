import { useState, useEffect, useMemo, type JSX } from "react";
import {
  Search,
  Trash2,
  Download,
  Edit2,
  AlertCircle,
  CheckCircle,
  UserPlus,
} from "lucide-react";
import { personaComunidadService } from "../services/persona-comunidad.service";
import { diccionarioColumnaService } from "../services/diccionario-columna.service";
import { ValidacionFrontend } from "../utils/validacion-frontend";
import type { PersonaComunidad } from "../services/persona-comunidad.service";
import type { DiccionarioColumna } from "../types/columnas";

export const Community = (): JSX.Element => {
  const [personas, setPersonas] = useState<PersonaComunidad[]>([]);
  const [columnas, setColumnas] = useState<DiccionarioColumna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<PersonaComunidad>>({});
  const [originalEditingData, setOriginalEditingData] = useState<
    Partial<PersonaComunidad>
  >({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPersona, setNewPersona] = useState<Omit<PersonaComunidad, "_id">>({
    datosAdicionales: {},
  });

  // Cargar datos iniciales con manejo de errores
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        await cargarDatos();
      } catch (error) {
        console.error("Error inicializando componente:", error);
        setError("Error al inicializar el componente");
        setLoading(false);
      }
    };

    initializeComponent();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar personas
      const personasResponse = await personaComunidadService.obtenerPersonas();
      if (personasResponse && personasResponse.success) {
        setPersonas(personasResponse.data || []);
      } else {
        setPersonas([]);
      }

      // Cargar columnas del diccionario
      try {
        const columnasResponse =
          await diccionarioColumnaService.obtenerColumnasParaFrontend();
        setColumnas(columnasResponse || []);
      } catch (columnasError) {
        console.warn(
          "Error al cargar columnas del diccionario:",
          columnasError
        );
        setColumnas([]);
      }
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError(
        err.response?.data?.detail || err.message || "Error al cargar datos"
      );
      setPersonas([]);
      setColumnas([]);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar campo de entrada según el tipo
  const renderCampoInput = (
    columna: DiccionarioColumna,
    valor: string,
    onChange: (valor: string) => void,
    disabled = false,
    compact = false
  ) => {
    const baseClassName = compact
      ? "w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-transparent"
      : "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent";

    switch (columna.tipo) {
      case "select":
        let opciones: string[] = [];
        if (columna.tipoValidacion === "lista" && columna.validacion) {
          try {
            opciones = JSON.parse(columna.validacion);
          } catch {
            // Fallback al formato anterior separado por comas
            opciones = columna.validacion.split(",").map((opt) => opt.trim());
          }
        }

        return (
          <select
            value={valor || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClassName}
          >
            <option value="">Seleccionar...</option>
            {opciones.map((opcion, index) => (
              <option key={index} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        );

      case "textarea":
        return (
          <textarea
            value={valor || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClassName}
            rows={compact ? 2 : 3}
            placeholder={
              columna.placeholder ||
              columna.valorPorDefecto ||
              `Ingrese ${columna.nombre.toLowerCase()}`
            }
          />
        );

      case "boolean":
        return (
          <select
            value={valor || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClassName}
          >
            <option value="">Seleccionar...</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        );

      case "date":
        return (
          <input
            type="date"
            value={valor || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClassName}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={valor || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClassName}
            placeholder={
              columna.placeholder ||
              columna.valorPorDefecto ||
              `Ingrese ${columna.nombre.toLowerCase()}`
            }
            min={columna.valorMinimo}
            max={columna.valorMaximo}
          />
        );

      case "email":
        return (
          <input
            type="email"
            value={valor || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClassName}
            placeholder={columna.placeholder || "ejemplo@correo.com"}
          />
        );

      default: // string, phone, url, etc.
        return (
          <input
            type="text"
            value={valor || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClassName}
            placeholder={
              columna.placeholder ||
              columna.valorPorDefecto ||
              `Ingrese ${columna.nombre.toLowerCase()}`
            }
            maxLength={columna.longitudMaxima}
            pattern={
              columna.tipoValidacion === "regex"
                ? columna.validacion
                : undefined
            }
            title={
              columna.tipoValidacion === "regex"
                ? `Debe coincidir con el patrón: ${columna.validacion}`
                : undefined
            }
          />
        );
    }
  };

  // Función auxiliar para mostrar el valor de un campo
  const mostrarValorCampo = (columna: DiccionarioColumna, valor: string) => {
    if (!valor) return "-";

    switch (columna.tipo) {
      case "boolean":
        return valor === "true" ? "Sí" : valor === "false" ? "No" : valor;
      case "date":
        try {
          return new Date(valor).toLocaleDateString();
        } catch {
          return valor;
        }
      default:
        return valor;
    }
  };
  const personasFiltradas = useMemo(() => {
    if (!searchTerm || !Array.isArray(personas)) return personas || [];

    return personas.filter((persona) => {
      if (!persona) return false;

      try {
        const searchLower = searchTerm.toLowerCase();

        // Búsqueda en todos los datos adicionales
        if (persona.datosAdicionales) {
          return Object.values(persona.datosAdicionales).some((valor) => {
            if (valor == null) return false;
            return String(valor).toLowerCase().includes(searchLower);
          });
        }

        return false;
      } catch (err) {
        console.warn("Error al filtrar persona:", persona, err);
        return false;
      }
    });
  }, [personas, searchTerm]);

  // Crear nueva persona
  const handleCrearPersona = async () => {
    try {
      // Validar usando el nuevo sistema
      const errores = ValidacionFrontend.validarFormulario(
        newPersona.datosAdicionales || {},
        columnas
      );

      if (errores.length > 0) {
        // Mostrar errores específicos por campo
        const erroresDetallados = errores
          .map((e) => `${e.campo}: ${e.mensaje}`)
          .join("\n");
        setError(`Errores de validación:\n${erroresDetallados}`);
        return;
      }

      // Preparar datos para el backend (sin transformación especial, el backend se encarga)
      const datosParaEnviar = {
        datosAdicionales: newPersona.datosAdicionales || {},
      };

      const response = await personaComunidadService.crearPersona(
        datosParaEnviar
      );
      if (response.success) {
        setPersonas((prev) => [...prev, response.data]);
        setNewPersona({ datosAdicionales: {} });
        setShowCreateForm(false);
        setError(null); // Limpiar errores en caso de éxito
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Error al crear persona"
      );
    }
  };

  // Iniciar edición
  const handleStartEdit = (persona: PersonaComunidad) => {
    setEditingId(persona._id!);
    // Preparar datos para edición incluyendo todos los datos adicionales
    const datosParaEdicion = {
      ...persona,
      datosAdicionales: persona.datosAdicionales || {},
    };
    setEditingData(datosParaEdicion);
    setOriginalEditingData(datosParaEdicion); // Guardar copia original
    setError(null); // Limpiar errores previos
  };

  // Guardar edición
  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      // Validar usando el nuevo sistema
      const errores = ValidacionFrontend.validarFormulario(
        editingData.datosAdicionales || {},
        columnas
      );

      if (errores.length > 0) {
        // Mostrar errores específicos por campo
        const erroresDetallados = errores
          .map((e) => `${e.campo}: ${e.mensaje}`)
          .join("\n");
        setError(`Errores de validación:\n${erroresDetallados}`);
        return;
      }

      // Preparar datos para el backend
      const datosParaEnviar = {
        datosAdicionales: editingData.datosAdicionales || {},
      };

      const response = await personaComunidadService.actualizarPersona(
        editingId,
        datosParaEnviar
      );

      if (response.success) {
        // Asegurar que los datos tienen la estructura correcta
        const updatedPersona: PersonaComunidad = {
          _id: response.data._id,
          datosAdicionales: response.data.datosAdicionales || {},
        };

        // Actualizar la lista de personas con los nuevos datos
        setPersonas((prev) => {
          const updated = prev.map((p) => {
            if (p._id === editingId) {
              return updatedPersona;
            }
            return p;
          });
          return updated;
        });

        setEditingId(null);
        setEditingData({});
        setOriginalEditingData({});
        setError(null); // Limpiar errores en caso de éxito
      }
    } catch (err: any) {
      console.error("Error al actualizar persona:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Error al actualizar persona"
      );
      // No resetear el estado de edición si hay error del servidor
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    // Restaurar datos originales en caso de que se hayan perdido por validación
    if (editingId && originalEditingData._id) {
      setPersonas((prev) =>
        prev.map((p) =>
          p._id === editingId ? (originalEditingData as PersonaComunidad) : p
        )
      );
    }
    setEditingId(null);
    setEditingData({});
    setOriginalEditingData({});
    setError(null); // Limpiar errores al cancelar
  };

  // Eliminar persona
  const handleEliminar = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta persona?")) return;

    try {
      const response = await personaComunidadService.eliminarPersona(id);
      if (response.success) {
        setPersonas((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Error al eliminar persona"
      );
    }
  };

  // Descargar datos
  const handleDescargar = async (formato: "CSV" | "Excel" | "PDF") => {
    try {
      const filtros = searchTerm ? { nombre: searchTerm } : undefined;
      const response = await personaComunidadService.descargarDatos(
        formato,
        filtros
      );

      if (response.success) {
        // Aquí podrías implementar la descarga real del archivo
        alert(
          `Descarga iniciada: ${response.nombreArchivo} (${response.datos.length} registros)`
        );
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Error al descargar datos"
      );
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error boundary manual
  if (error === "Error al inicializar el componente") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold text-red-800 mb-4">
          Error al cargar el componente
        </h2>
        <p className="text-red-700 mb-4">
          Hubo un problema al inicializar la gestión de comunidad.
        </p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            cargarDatos();
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Gestión de Comunidad
        </h1>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <div className="text-sm text-red-700 mt-1">
                {error.includes("\n") ? (
                  <ul className="list-disc list-inside space-y-1">
                    {error.split("\n").map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{error}</p>
                )}
              </div>
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-600 hover:text-red-800 mt-2 underline"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Herramientas */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Búsqueda */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar en todos los campos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Nueva Persona</span>
              </button>

              <div className="relative group">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Descargar</span>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button
                    onClick={() => handleDescargar("CSV")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-lg"
                  >
                    Descargar CSV
                  </button>
                  <button
                    onClick={() => handleDescargar("Excel")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    Descargar Excel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="mt-4 flex space-x-4 text-sm text-gray-600">
            <span>Total: {personas.length}</span>
            <span>Mostrando: {personasFiltradas.length}</span>
          </div>
        </div>

        {/* Formulario de crear nueva persona */}
        {showCreateForm && (
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Nueva Persona
            </h3>

            {/* Columnas dinámicas del diccionario */}
            {columnas.length > 0 ? (
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-700 mb-3">
                  Información de la Persona
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {columnas.map((columna) => (
                    <div key={columna._id}>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {columna.nombre}
                        {columna.requerido && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      {renderCampoInput(
                        columna,
                        newPersona.datosAdicionales?.[columna.nombre] || "",
                        (valor) =>
                          setNewPersona((prev) => ({
                            ...prev,
                            datosAdicionales: {
                              ...prev.datosAdicionales,
                              [columna.nombre]: valor,
                            },
                          }))
                      )}
                      {columna.descripcion && (
                        <p className="text-xs text-gray-500 mt-1">
                          {columna.descripcion}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  No hay columnas configuradas en el diccionario. Configure las
                  columnas en la sección de Configuración antes de crear
                  personas.
                </p>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={handleCrearPersona}
                disabled={
                  columnas.length === 0 ||
                  columnas
                    .filter((col) => col.requerido)
                    .some(
                      (col) =>
                        !newPersona.datosAdicionales?.[col.nombre] ||
                        newPersona.datosAdicionales[col.nombre].trim() === ""
                    )
                }
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Crear Persona</span>
              </button>

              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewPersona({ datosAdicionales: {} });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Tabla de datos */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {columnas.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No hay columnas configuradas
              </h3>
              <p className="text-gray-600 mb-4">
                Debe configurar las columnas en la sección de Configuración
                antes de gestionar personas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {columnas.map((columna) => (
                      <th
                        key={columna._id}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {columna.nombre}
                        {columna.requerido && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {personasFiltradas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columnas.length + 1}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        {searchTerm
                          ? "No se encontraron resultados"
                          : "No hay personas registradas"}
                      </td>
                    </tr>
                  ) : (
                    personasFiltradas.map((persona) => {
                      return (
                        <tr key={persona._id} className="hover:bg-gray-50">
                          {/* Columnas dinámicas del diccionario */}
                          {columnas.map((columna) => (
                            <td
                              key={columna._id}
                              className="px-4 py-3 text-sm text-gray-900"
                            >
                              {editingId === persona._id ? (
                                renderCampoInput(
                                  columna,
                                  editingData.datosAdicionales?.[
                                    columna.nombre
                                  ] || "",
                                  (valor) =>
                                    setEditingData((prev) => ({
                                      ...prev,
                                      datosAdicionales: {
                                        ...prev.datosAdicionales,
                                        [columna.nombre]: valor,
                                      },
                                    })),
                                  false,
                                  true // modo compacto para la tabla
                                )
                              ) : (
                                <span>
                                  {mostrarValorCampo(
                                    columna,
                                    persona.datosAdicionales?.[
                                      columna.nombre
                                    ] || ""
                                  )}
                                </span>
                              )}
                            </td>
                          ))}

                          <td className="px-4 py-3 text-sm">
                            {editingId === persona._id ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleSaveEdit}
                                  className="text-green-600 hover:text-green-700"
                                  title="Guardar"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="text-gray-600 hover:text-gray-700"
                                  title="Cancelar"
                                >
                                  <AlertCircle className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStartEdit(persona)}
                                  className="text-blue-600 hover:text-blue-700"
                                  title="Editar"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleEliminar(persona._id!)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  } catch (renderError) {
    console.error("Error de renderización:", renderError);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold text-red-800 mb-4">
          Error de renderización
        </h2>
        <p className="text-red-700 mb-4">
          Ocurrió un error inesperado al mostrar la información.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Recargar página
        </button>
      </div>
    );
  }
};
