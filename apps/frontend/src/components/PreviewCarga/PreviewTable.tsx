import {
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  UserPlus,
  RefreshCw,
  Check,
  X,
} from "lucide-react";
import type {
  PersonaComunidadTemporal,
  EstadoPreviewPersona,
} from "@/types/persona-comunidad-temporal";
import type { DiccionarioColumna } from "@/types/columnas";
import { FieldEditor } from "./FieldEditor";

interface PreviewTableProps {
  registros: PersonaComunidadTemporal[];
  columnas: DiccionarioColumna[];
  editingId: string | null;
  editingData: Record<string, string>;
  onEditingDataChange: (data: Record<string, string>) => void;
  onStartEdit: (registro: PersonaComunidadTemporal) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDeleteRecord: (id: string) => void;
}

export const PreviewTable = ({
  registros,
  columnas,
  editingId,
  editingData,
  onEditingDataChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDeleteRecord,
}: PreviewTableProps) => {
  const obtenerClaseEstado = (estado: EstadoPreviewPersona) => {
    switch (estado) {
      case "nuevo":
        return "bg-green-50 border-l-4 border-green-400";
      case "actualizar":
        return "bg-blue-50 border-l-4 border-blue-400";
      case "error":
        return "bg-red-50 border-l-4 border-red-400";
      case "sin_cambios":
        return "bg-gray-50 border-l-4 border-gray-400";
      default:
        return "bg-white";
    }
  };

  const obtenerIconoEstado = (estado: EstadoPreviewPersona) => {
    switch (estado) {
      case "nuevo":
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case "actualizar":
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "sin_cambios":
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const obtenerTextoEstado = (estado: EstadoPreviewPersona) => {
    switch (estado) {
      case "nuevo":
        return "Nuevo";
      case "actualizar":
        return "Actualizar";
      case "error":
        return "Error";
      case "sin_cambios":
        return "Sin cambios";
      default:
        return estado;
    }
  };

  const renderValorCampo = (
    registro: PersonaComunidadTemporal,
    columna: DiccionarioColumna
  ) => {
    const valorNuevo = registro.datosAdicionales[columna.nombre] || "";
    const valorAnterior = registro.datosAnteriores?.[columna.nombre] || "";

    // Verificar si este campo específico tiene errores
    const tieneErrorEnCampo = registro.errores.some((error) =>
      error.toLowerCase().includes(columna.nombre.toLowerCase())
    );

    // Si es una actualización y hay diferencias, mostrar ambos valores
    if (registro.estado === "actualizar" && valorAnterior !== valorNuevo) {
      return (
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Anterior:</div>
          <div className="text-sm text-red-600 line-through bg-red-50 px-2 py-1 rounded">
            {valorAnterior || "-"}
          </div>
          <div className="text-xs text-gray-500">Nuevo:</div>
          <div
            className={`text-sm px-2 py-1 rounded ${
              tieneErrorEnCampo
                ? "bg-red-100 text-red-800 border border-red-300"
                : "bg-green-100 text-green-800"
            }`}
          >
            {valorNuevo || "-"}
          </div>
        </div>
      );
    }

    // Para otros casos, mostrar solo el valor actual
    return (
      <div
        className={`text-sm px-2 py-1 rounded ${
          tieneErrorEnCampo
            ? "bg-red-100 text-red-800 border border-red-300"
            : registro.estado === "nuevo"
            ? "bg-green-50 text-green-800"
            : ""
        }`}
      >
        {valorNuevo || "-"}
      </div>
    );
  };

  // Ordenar registros: errores primero, luego por número de fila
  const registrosOrdenados = [...registros].sort((a, b) => {
    if (a.estado === "error" && b.estado !== "error") return -1;
    if (a.estado !== "error" && b.estado === "error") return 1;
    return (a.numeroFila || 0) - (b.numeroFila || 0);
  });

  if (registros.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md text-center">
        <p className="text-gray-500">No hay registros para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto max-h-96">
        <table className="min-w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fila
              </th>
              {columnas.map((columna) => (
                <th
                  key={columna._id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]"
                >
                  {columna.descripcion || columna.nombre}
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
            {registrosOrdenados.map((registro) => (
              <tr
                key={registro._id}
                className={`${obtenerClaseEstado(
                  registro.estado
                )} hover:bg-opacity-75`}
              >
                {/* Estado */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {obtenerIconoEstado(registro.estado)}
                    <span className="text-sm font-medium">
                      {obtenerTextoEstado(registro.estado)}
                    </span>
                  </div>
                  {registro.errores.length > 0 && (
                    <div className="mt-1">
                      {registro.errores.map((error, index) => (
                        <div
                          key={index}
                          className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded mt-1"
                        >
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </td>

                {/* Número de fila */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {registro.numeroFila}
                </td>

                {/* Campos */}
                {columnas.map((columna) => (
                  <td
                    key={`${registro._id}-${columna._id}`}
                    className="px-4 py-4 text-sm"
                  >
                    {editingId === registro._id ? (
                      <FieldEditor
                        columna={columna}
                        valor={editingData[columna.nombre] || ""}
                        onChange={(valor) =>
                          onEditingDataChange({
                            ...editingData,
                            [columna.nombre]: valor,
                          })
                        }
                        hasError={registro.errores.some((error) =>
                          error
                            .toLowerCase()
                            .includes(columna.nombre.toLowerCase())
                        )}
                      />
                    ) : (
                      renderValorCampo(registro, columna)
                    )}
                  </td>
                ))}

                {/* Acciones */}
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  {editingId === registro._id ? (
                    <div className="flex space-x-1">
                      <button
                        onClick={onSaveEdit}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Guardar"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={onCancelEdit}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onStartEdit(registro)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          registro._id && onDeleteRecord(registro._id)
                        }
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
