import React from 'react';
import { Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import type { PersonaComunidad } from '@/services/persona-comunidad.service';
import type { DiccionarioColumna } from '@/types/columnas';
import { renderCampoInput, mostrarValorCampo } from '@/utils/formUtils';

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
  onEditingDataChange
}) => {
  if (columnas.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No hay columnas configuradas
          </h3>
          <p className="text-gray-600 mb-4">
            Debe configurar las columnas en la sección de Configuración
            antes de gestionar personas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
            {personas.length === 0 ? (
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
              personas.map((persona) => (
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
                          editingData.datosAdicionales?.[columna.nombre] || "",
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
                        )
                      ) : (
                        <span>
                          {mostrarValorCampo(
                            columna,
                            persona.datosAdicionales?.[columna.nombre] || ""
                          )}
                        </span>
                      )}
                    </td>
                  ))}

                  <td className="px-4 py-3 text-sm">
                    {editingId === persona._id ? (
                      <div className="flex space-x-2">
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
                      <div className="flex space-x-2">
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
    </div>
  );
};
