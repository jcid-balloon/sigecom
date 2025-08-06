import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { PersonaComunidad } from '@/services/persona-comunidad.service';
import type { DiccionarioColumna } from '@/types/columnas';
import { renderCampoInput } from '@/utils/formUtils';

interface FormularioPersonaProps {
  show: boolean;
  columnas: DiccionarioColumna[];
  persona: Omit<PersonaComunidad, '_id'>;
  onSave: () => void;
  onCancel: () => void;
  onChange: (persona: Omit<PersonaComunidad, '_id'>) => void;
  title?: string;
  submitButtonText?: string;
  isEditing?: boolean;
}

export const FormularioPersona: React.FC<FormularioPersonaProps> = ({
  show,
  columnas,
  persona,
  onSave,
  onCancel,
  onChange,
  title = "Nueva Persona",
  submitButtonText = "Crear Persona",
  isEditing = false
}) => {
  if (!show) return null;

  const isFormValid = () => {
    if (columnas.length === 0) return false;
    
    // Verificar campos requeridos
    return !columnas
      .filter((col) => col.requerido)
      .some(
        (col) =>
          !persona.datosAdicionales?.[col.nombre] ||
          String(persona.datosAdicionales[col.nombre]).trim() === ""
      );
  };

  const handleFieldChange = (columnName: string, value: any) => {
    onChange({
      ...persona,
      datosAdicionales: {
        ...persona.datosAdicionales,
        [columnName]: value,
      },
    });
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${
      isEditing ? 'border-blue-500' : 'border-green-500'
    }`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {title}
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
                  persona.datosAdicionales?.[columna.nombre] || "",
                  (valor) => handleFieldChange(columna.nombre, valor)
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
            columnas en la sección de Configuración antes de {isEditing ? 'editar' : 'crear'}
            personas.
          </p>
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={onSave}
          disabled={!isFormValid()}
          className={`${
            isEditing 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-green-600 hover:bg-green-700'
          } text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
        >
          <CheckCircle className="h-4 w-4" />
          <span>{submitButtonText}</span>
        </button>

        <button
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
        >
          Cancelar
        </button>
      </div>

      {/* Indicador de campos requeridos */}
      {columnas.some(col => col.requerido) && (
        <div className="mt-4 text-xs text-gray-500">
          <span className="text-red-500">*</span> Campos obligatorios
        </div>
      )}
    </div>
  );
};
