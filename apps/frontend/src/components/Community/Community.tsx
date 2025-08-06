import { useState, useEffect, useMemo } from "react";
import { personaComunidadService } from "@/services/persona-comunidad.service";
import { diccionarioColumnaService } from "@/services/diccionario-columna.service";
import type { PersonaComunidad } from "@/services/persona-comunidad.service";
import type { DiccionarioColumna } from "@/types/columnas";
import type { FiltroModular } from "@/utils/filterUtils";

// Componentes modulares
import { ControlsCommunity } from "./ControlsCommunity";
import { FiltrosAvanzados } from "./FiltrosAvanzados";
import { PersonasTabla } from "./PersonasTabla";
import { FormularioPersona } from "./FormularioPersona";

// Utilidades
import { evaluarFiltro } from "@/utils/filterUtils";
import { generarArchivoLocal } from "@/utils/exportUtils";
import { ValidacionFrontend } from "@/utils/validacion-frontend";

export const Community = () => {
  // Estados principales
  const [personas, setPersonas] = useState<PersonaComunidad[]>([]);
  const [columnas, setColumnas] = useState<DiccionarioColumna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados de filtros
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filtrosModulares, setFiltrosModulares] = useState<FiltroModular[]>([]);
  
  // Estados de edición
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<PersonaComunidad>>({});
  const [originalEditingData, setOriginalEditingData] = useState<Partial<PersonaComunidad>>({});
  
  // Estados de creación
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPersona, setNewPersona] = useState<Omit<PersonaComunidad, "_id">>({
    datosAdicionales: {},
  });
  
  // Estados de descarga
  const [isDownloading, setIsDownloading] = useState(false);

  // Cargar datos iniciales
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
        const columnasResponse = await diccionarioColumnaService.obtenerColumnasParaFrontend();
        setColumnas(columnasResponse || []);
      } catch (columnasError) {
        console.warn("Error al cargar columnas del diccionario:", columnasError);
        setColumnas([]);
      }
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError(err.response?.data?.detail || err.message || "Error al cargar datos");
      setPersonas([]);
      setColumnas([]);
    } finally {
      setLoading(false);
    }
  };

  // Handlers para filtros
  const agregarFiltro = () => {
    const nuevoFiltro: FiltroModular = {
      id: Date.now().toString(),
      columna: '',
      operador: '',
      valor: '',
      logica: 'AND'
    };
    setFiltrosModulares([...filtrosModulares, nuevoFiltro]);
  };

  const actualizarFiltro = (filtroActualizado: FiltroModular) => {
    setFiltrosModulares(filtros =>
      filtros.map(f => f.id === filtroActualizado.id ? filtroActualizado : f)
    );
  };

  const eliminarFiltro = (id: string) => {
    setFiltrosModulares(filtros => filtros.filter(f => f.id !== id));
  };

  const cambiarLogicaFiltro = (id: string, logica: 'AND' | 'OR') => {
    setFiltrosModulares(filtros =>
      filtros.map(f => f.id === id ? { ...f, logica } : f)
    );
  };

  const limpiarFiltros = () => {
    setFiltrosModulares([]);
    setSearchTerm("");
    setShowAdvancedFilters(false);
  };

  const contarFiltrosActivos = () => {
    return filtrosModulares.filter(f => 
      f.columna && f.operador && (f.valor !== '' || ['es_nulo', 'no_es_nulo'].includes(f.operador))
    ).length;
  };

  // Filtrar personas
  const personasFiltradas = useMemo(() => {
    if (!Array.isArray(personas)) return [];

    let resultado = [...personas];

    // Filtro de búsqueda general
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      resultado = resultado.filter((persona) => {
        if (!persona?.datosAdicionales) return false;
        return Object.values(persona.datosAdicionales).some((valor) => {
          if (valor == null) return false;
          return String(valor).toLowerCase().includes(searchLower);
        });
      });
    }

    // Filtros modulares con operadores lógicos
    if (filtrosModulares.length > 0) {
      resultado = resultado.filter((persona) => {
        if (!persona?.datosAdicionales) return false;

        // Evaluar cada filtro
        const resultadosFiltros = filtrosModulares.map(filtro => {
          const valorPersona = persona.datosAdicionales[filtro.columna];
          const columna = columnas.find(col => col.nombre === filtro.columna);
          
          if (!columna) return false;
          return evaluarFiltro(valorPersona, filtro.operador, filtro.valor, columna.tipo);
        });

        // Aplicar lógica de operadores AND/OR
        if (resultadosFiltros.length === 1) {
          return resultadosFiltros[0];
        }

        let resultado = resultadosFiltros[0];
        for (let i = 1; i < resultadosFiltros.length; i++) {
          const operadorLogico = filtrosModulares[i - 1].logica;
          if (operadorLogico === 'AND') {
            resultado = resultado && resultadosFiltros[i];
          } else {
            resultado = resultado || resultadosFiltros[i];
          }
        }

        return resultado;
      });
    }

    return resultado;
  }, [personas, searchTerm, filtrosModulares, columnas]);

  // Handlers para personas
  const handleCrearPersona = async () => {
    try {
      const errores = ValidacionFrontend.validarFormulario(
        newPersona.datosAdicionales || {},
        columnas
      );

      if (errores.length > 0) {
        const erroresDetallados = errores
          .map((e) => `${e.campo}: ${e.mensaje}`)
          .join("\n");
        setError(`Errores de validación:\n${erroresDetallados}`);
        return;
      }

      const datosParaEnviar = {
        datosAdicionales: newPersona.datosAdicionales || {},
      };

      const response = await personaComunidadService.crearPersona(datosParaEnviar);
      if (response.success) {
        setPersonas((prev) => [...prev, response.data]);
        setNewPersona({ datosAdicionales: {} });
        setShowCreateForm(false);
        setError(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al crear persona");
    }
  };

  const handleStartEdit = (persona: PersonaComunidad) => {
    setEditingId(persona._id!);
    const datosParaEdicion = {
      ...persona,
      datosAdicionales: persona.datosAdicionales || {},
    };
    setEditingData(datosParaEdicion);
    setOriginalEditingData(datosParaEdicion);
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const errores = ValidacionFrontend.validarFormulario(
        editingData.datosAdicionales || {},
        columnas
      );

      if (errores.length > 0) {
        const erroresDetallados = errores
          .map((e) => `${e.campo}: ${e.mensaje}`)
          .join("\n");
        setError(`Errores de validación:\n${erroresDetallados}`);
        return;
      }

      const datosParaEnviar = {
        datosAdicionales: editingData.datosAdicionales || {},
      };

      const response = await personaComunidadService.actualizarPersona(
        editingId,
        datosParaEnviar
      );

      if (response.success) {
        const updatedPersona: PersonaComunidad = {
          _id: response.data._id,
          datosAdicionales: response.data.datosAdicionales || {},
        };

        setPersonas((prev) =>
          prev.map((p) => (p._id === editingId ? updatedPersona : p))
        );

        setEditingId(null);
        setEditingData({});
        setOriginalEditingData({});
        setError(null);
      }
    } catch (err: any) {
      console.error("Error al actualizar persona:", err);
      setError(
        err.response?.data?.detail || err.message || "Error al actualizar persona"
      );
    }
  };

  const handleCancelEdit = () => {
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
    setError(null);
  };

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

  // Handler para descarga
  const handleDescargar = async (formato: "CSV" | "EXCEL") => {
    setIsDownloading(true);
    setError(null);

    try {
      if (personasFiltradas.length === 0) {
        alert("⚠️ No hay datos para descargar. Verifique que hay personas registradas y que los filtros no estén muy restrictivos.");
        return;
      }

      // Generar archivo localmente usando la utilidad
      generarArchivoLocal(personasFiltradas, columnas, formato === "EXCEL" ? "Excel" : formato);

      // Registrar la descarga en el historial del backend
      try {
        const informacionFiltros = {
          busquedaGeneral: searchTerm || undefined,
          filtrosModulares: filtrosModulares.length > 0 ? filtrosModulares : undefined,
          totalPersonas: personas.length,
          personasFiltradas: personasFiltradas.length,
          fechaDescarga: new Date().toISOString()
        };

        await personaComunidadService.registrarDescarga(
          formato === "EXCEL" ? "Excel" : formato,
          personasFiltradas.length,
          informacionFiltros
        );
      } catch (historialError) {
        console.warn("Error al registrar historial de descarga:", historialError);
      }

      const filtrosAplicados = searchTerm || contarFiltrosActivos() > 0;
      const mensaje = filtrosAplicados 
        ? `✅ Descarga completada con filtros aplicados: ${personasFiltradas.length} registros`
        : `✅ Descarga completada: ${personasFiltradas.length} registros`;
      
      alert(mensaje);
    } catch (err: any) {
      console.error("Error al descargar:", err);
      setError("Error al generar el archivo de descarga. Intente nuevamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Loading state
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

  // Error boundary
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
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
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
                <div className="mt-4">
                  <button
                    onClick={() => setError(null)}
                    className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controles principales */}
        <ControlsCommunity
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearSearch={() => setSearchTerm("")}
          onDownload={handleDescargar}
          onShowCreateForm={() => setShowCreateForm(true)}
          isDownloading={isDownloading}
          totalPersonas={personas.length}
          personasFiltradas={personasFiltradas.length}
          filtrosActivos={contarFiltrosActivos()}
        />

        {/* Filtros Avanzados */}
        <FiltrosAvanzados
          show={showAdvancedFilters}
          filtros={filtrosModulares}
          columnas={columnas}
          onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
          onAddFilter={agregarFiltro}
          onUpdateFilter={actualizarFiltro}
          onRemoveFilter={eliminarFiltro}
          onClearAllFilters={limpiarFiltros}
          onLogicChange={cambiarLogicaFiltro}
        />

        {/* Formulario de crear persona */}
        <FormularioPersona
          show={showCreateForm}
          columnas={columnas}
          persona={newPersona}
          onSave={handleCrearPersona}
          onCancel={() => {
            setShowCreateForm(false);
            setNewPersona({ datosAdicionales: {} });
          }}
          onChange={setNewPersona}
          title="Nueva Persona"
          submitButtonText="Crear Persona"
        />

        {/* Tabla de personas */}
        <PersonasTabla
          personas={personasFiltradas}
          columnas={columnas}
          searchTerm={searchTerm}
          editingId={editingId}
          editingData={editingData}
          onStartEdit={handleStartEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onDelete={handleEliminar}
          onEditingDataChange={setEditingData}
        />
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

export default Community;