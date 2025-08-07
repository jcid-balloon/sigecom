import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  UserPlus,
  RefreshCw,
  Check,
  X,
  Info,
} from "lucide-react";
import type {
  PersonaComunidadTemporal,
  EstadoPreviewPersona,
} from "@/types/persona-comunidad-temporal";
import type { DiccionarioColumna } from "@/types/columnas";
import { FieldEditor } from "./FieldEditor";
import InfoModal from "@/components/utils/InfoModal";

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
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
    tooltipMode: boolean;
    mousePosition?: { x: number; y: number };
  }>({
    isOpen: false,
    title: "",
    content: "",
    tooltipMode: false,
  });

  const handleInfoClick = (
    columna: DiccionarioColumna,
    event: React.MouseEvent
  ) => {
    if (columna.descripcion) {
      event.preventDefault();
      setInfoModal({
        isOpen: true,
        title: columna.nombre,
        content: columna.descripcion,
        tooltipMode: true,
        mousePosition: { x: event.clientX, y: event.clientY },
      });
    }
  };

  const handleInfoMouseLeave = () => {
    setInfoModal((prev) => ({ ...prev, isOpen: false }));
  };
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
          <div
            className="text-sm text-red-600 line-through bg-red-50 px-2 py-1 rounded"
            style={{ wordBreak: "break-word" }}
          >
            {valorAnterior || "-"}
          </div>
          <div className="text-xs text-gray-500">Nuevo:</div>
          <div
            className={`text-sm px-2 py-1 rounded ${
              tieneErrorEnCampo
                ? "bg-red-100 text-red-800 border border-red-300"
                : "bg-green-100 text-green-800"
            }`}
            style={{ wordBreak: "break-word" }}
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
        style={{ wordBreak: "break-word" }}
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
      {/* Contenedor de tabla con scroll horizontal controlado */}
      <div className="overflow-x-auto" style={{ maxWidth: "100%" }}>
        <table className="w-full" style={{ minWidth: "max-content" }}>
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                style={{ minWidth: "150px" }}
              >
                Estado
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                style={{ minWidth: "80px" }}
              >
                Fila
              </th>
              {columnas.map((columna) => (
                <th
                  key={columna._id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  style={{ minWidth: "200px" }}
                >
                  <div className="flex items-center space-x-2">
                    <span>
                      {columna.nombre}
                      {columna.requerido && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </span>
                    {columna.descripcion && (
                      <div>
                        <Info
                          className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                          onMouseEnter={(event) =>
                            handleInfoClick(columna, event)
                          }
                          onMouseLeave={handleInfoMouseLeave}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {/* Columna de acciones sticky */}
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-gray-50 border-l border-gray-200 shadow-lg z-20"
                style={{ minWidth: "120px" }}
              >
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
                <td
                  className="px-6 py-4 text-sm text-gray-900"
                  style={{ minWidth: "150px" }}
                >
                  <div style={{ minHeight: "40px" }}>
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
                            className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded mt-1 break-words"
                          >
                            {error}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>

                {/* Número de fila */}
                <td
                  className="px-6 py-4 text-sm text-gray-900"
                  style={{ minWidth: "80px" }}
                >
                  <div
                    style={{
                      minHeight: "40px",
                      display: "flex",
                      alignItems: "flex-start",
                    }}
                  >
                    {registro.numeroFila}
                  </div>
                </td>

                {/* Campos */}
                {columnas.map((columna) => (
                  <td
                    key={`${registro._id}-${columna._id}`}
                    className="px-6 py-4 text-sm text-gray-900"
                    style={{ minWidth: "200px" }}
                  >
                    <div style={{ minHeight: "40px" }}>
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
                        <div className="break-words">
                          {renderValorCampo(registro, columna)}
                        </div>
                      )}
                    </div>
                  </td>
                ))}

                {/* Celda de acciones sticky */}
                <td
                  className="px-6 py-4 text-sm sticky right-0 bg-white border-l border-gray-200 shadow-lg z-20"
                  style={{ minWidth: "120px" }}
                >
                  <div
                    style={{
                      minHeight: "40px",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                  >
                    {editingId === registro._id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={onSaveEdit}
                          className="text-green-600 hover:text-green-700"
                          title="Guardar"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={onCancelEdit}
                          className="text-gray-600 hover:text-gray-700"
                          title="Cancelar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onStartEdit(registro)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            registro._id && onDeleteRecord(registro._id)
                          }
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfoModal
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal((prev) => ({ ...prev, isOpen: false }))}
        title={infoModal.title}
        content={infoModal.content}
        tooltipMode={infoModal.tooltipMode}
        mousePosition={infoModal.mousePosition}
      />
    </div>
  );
};
