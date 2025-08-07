import React, { useState } from "react";
import { Edit2, Trash2, CheckCircle, AlertCircle, Info } from "lucide-react";
import type { PersonaComunidad } from "@/services/persona-comunidad.service";
import type { DiccionarioColumna } from "@/types/columnas";
import {
  renderCampoInput,
  mostrarValorCampo,
} from "@/components/utils/formUtils";
import InfoModal from "@/components/utils/InfoModal";

interface PersonasTablaProps {
  personas: PersonaComunidad[];
  columnas: DiccionarioColumna[];
  searchTerm?: string;
  editingId: string | null;
  editingData: Partial<PersonaComunidad>;
  onStartEdit: (persona: PersonaComunidad) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onEditingDataChange: (data: Partial<PersonaComunidad>) => void;
}

export const PersonasTabla: React.FC<PersonasTablaProps> = ({
  personas,
  columnas,
  searchTerm,
  editingId,
  editingData,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onEditingDataChange,
}) => {
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
  if (columnas.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No hay columnas configuradas
          </h3>
          <p className="text-gray-600 mb-4">
            Debe configurar las columnas en la sección de Configuración antes de
            gestionar personas.
          </p>
        </div>
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
            {personas.length === 0 ? (
              <tr>
                <td
                  colSpan={columnas.length + 1}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  {searchTerm
                    ? "No se encontraron resultados"
                    : "No hay personas registradas"}
                </td>
              </tr>
            ) : (
              personas.map((persona) => (
                <tr key={persona._id} className="hover:bg-gray-50">
                  {/* Columnas dinámicas del diccionario */}
                  {columnas.map((columna) => (
                    <td
                      key={columna._id}
                      className="px-6 py-4 text-sm text-gray-900"
                      style={{ minWidth: "200px" }}
                    >
                      {editingId === persona._id ? (
                        <div className="w-full" style={{ minWidth: "180px" }}>
                          {renderCampoInput(
                            columna,
                            editingData.datosAdicionales?.[columna.nombre] ||
                              "",
                            (valor) =>
                              onEditingDataChange({
                                ...editingData,
                                datosAdicionales: {
                                  ...editingData.datosAdicionales,
                                  [columna.nombre]: valor,
                                },
                              }),
                            false,
                            true // modo compacto para la tabla
                          )}
                        </div>
                      ) : (
                        <div className="break-words">
                          {mostrarValorCampo(
                            columna,
                            persona.datosAdicionales?.[columna.nombre] || ""
                          )}
                        </div>
                      )}
                    </td>
                  ))}

                  {/* Celda de acciones sticky */}
                  <td
                    className="px-6 py-4 text-sm sticky right-0 bg-white border-l border-gray-200 shadow-lg z-20"
                    style={{ minWidth: "120px" }}
                  >
                    {editingId === persona._id ? (
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={onSaveEdit}
                          className="text-green-600 hover:text-green-700"
                          title="Guardar"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={onCancelEdit}
                          className="text-gray-600 hover:text-gray-700"
                          title="Cancelar"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={() => onStartEdit(persona)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(persona._id!)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
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
