import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { PersonaComunidadTemporalService } from "@/services/persona-comunidad-temporal.service";
import { diccionarioColumnaService } from "@/services/diccionario-columna.service";
import { ValidacionFrontend } from "@/utils/validacion-frontend";
import type {
  PersonaComunidadTemporal,
  PreviewSesion,
} from "@/types/persona-comunidad-temporal";
import type { DiccionarioColumna } from "@/types/columnas";
import { PreviewSummary } from "@/components/PreviewCarga/PreviewSummary";
import { PreviewTable } from "@/components/PreviewCarga/PreviewTable";
import { PreviewControls } from "@/components/PreviewCarga/PreviewControls";

interface PreviewCargaMasivaProps {
  sesionId: string;
  onConfirmarCarga: () => void;
  onCancelar: () => void;
}

const PreviewCargaMasiva = ({
  sesionId,
  onConfirmarCarga,
  onCancelar,
}: PreviewCargaMasivaProps) => {
  const [preview, setPreview] = useState<PreviewSesion | null>(null);
  const [columnas, setColumnas] = useState<DiccionarioColumna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Record<string, string>>({});
  const [confirmandoCarga, setConfirmandoCarga] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [sesionId]);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);

    try {
      const [previewResponse, columnasResponse] = await Promise.all([
        PersonaComunidadTemporalService.obtenerPreviewPorSesion(sesionId),
        diccionarioColumnaService.obtenerColumnas(),
      ]);

      if (previewResponse.success) {
        setPreview(previewResponse.data);
        setColumnas(columnasResponse);
      } else {
        setError("Error al cargar los datos de previsualización");
      }
    } catch (err: any) {
      console.error("Error cargando preview:", err);
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicion = (registro: PersonaComunidadTemporal) => {
    if (registro._id) {
      setEditingId(registro._id);
      setEditingData(registro.datosAdicionales);
    }
  };

  const guardarEdicion = async () => {
    if (!editingId) return;

    try {
      // Validar datos antes de enviar
      const errores = ValidacionFrontend.validarFormulario(
        editingData,
        columnas
      );
      if (errores.length > 0) {
        // Mostrar errores específicos por campo
        const erroresDetallados = errores
          .map((e) => `${e.campo}: ${e.mensaje}`)
          .join("\\n");
        setError(`Errores de validación:\\n${erroresDetallados}`);
        return;
      }

      const response =
        await PersonaComunidadTemporalService.actualizarRegistroTemporal(
          editingId,
          editingData
        );

      if (response.success) {
        // Actualizar el registro en el preview local
        setPreview((prev) => {
          if (!prev) return prev;

          const registrosActualizados = prev.registros.map((r) =>
            r._id === editingId ? response.data : r
          );

          // Recalcular resumen
          const nuevos = registrosActualizados.filter(
            (r) => r.estado === "nuevo"
          ).length;
          const actualizaciones = registrosActualizados.filter(
            (r) => r.estado === "actualizar"
          ).length;
          const errores = registrosActualizados.filter(
            (r) => r.estado === "error"
          ).length;
          const sinCambios = registrosActualizados.filter(
            (r) => r.estado === "sin_cambios"
          ).length;

          return {
            registros: registrosActualizados,
            resumen: {
              total: registrosActualizados.length,
              nuevos,
              actualizaciones,
              errores,
              sinCambios,
            },
          };
        });

        setEditingId(null);
        setEditingData({});
        setError(null);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al actualizar registro"
      );
    }
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setEditingData({});
    setError(null);
  };

  const eliminarRegistro = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este registro?"))
      return;

    try {
      const response =
        await PersonaComunidadTemporalService.eliminarRegistroTemporal(id);

      if (response.success) {
        // Remover del preview local
        setPreview((prev) => {
          if (!prev) return prev;

          const registrosFiltrados = prev.registros.filter((r) => r._id !== id);

          // Recalcular resumen
          const nuevos = registrosFiltrados.filter(
            (r) => r.estado === "nuevo"
          ).length;
          const actualizaciones = registrosFiltrados.filter(
            (r) => r.estado === "actualizar"
          ).length;
          const errores = registrosFiltrados.filter(
            (r) => r.estado === "error"
          ).length;
          const sinCambios = registrosFiltrados.filter(
            (r) => r.estado === "sin_cambios"
          ).length;

          return {
            registros: registrosFiltrados,
            resumen: {
              total: registrosFiltrados.length,
              nuevos,
              actualizaciones,
              errores,
              sinCambios,
            },
          };
        });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al eliminar registro"
      );
    }
  };

  const confirmarCarga = async () => {
    if (!preview || preview.resumen.errores > 0) {
      setError("No se puede confirmar la carga mientras haya errores");
      return;
    }

    setConfirmandoCarga(true);
    try {
      const response =
        await PersonaComunidadTemporalService.confirmarCargaDefinitiva(
          sesionId
        );

      if (response.success) {
        onConfirmarCarga();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Error al confirmar carga"
      );
    } finally {
      setConfirmandoCarga(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-700">No se pudo cargar la previsualización.</p>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={cargarDatos}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reintentar
          </button>
          <button
            onClick={onCancelar}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Previsualización de Carga
          </h2>
          <button
            onClick={onCancelar}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Resumen */}
        <PreviewSummary resumen={preview.resumen} />

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-red-700">
                {error.includes("\\n") ? (
                  <ul className="list-disc list-inside space-y-1">
                    {error.split("\\n").map((line, index) => (
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
      </div>

      {/* Tabla de datos */}
      <PreviewTable
        registros={preview.registros}
        columnas={columnas}
        editingId={editingId}
        editingData={editingData}
        onEditingDataChange={setEditingData}
        onStartEdit={iniciarEdicion}
        onSaveEdit={guardarEdicion}
        onCancelEdit={cancelarEdicion}
        onDeleteRecord={eliminarRegistro}
      />

      {/* Controles */}
      <PreviewControls
        canConfirm={preview.resumen.errores === 0}
        isConfirming={confirmandoCarga}
        onConfirmar={confirmarCarga}
        onCancelar={onCancelar}
      />
    </div>
  );
};

export default PreviewCargaMasiva;
