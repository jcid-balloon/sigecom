import React, { useRef } from "react";
import type { DiccionarioColumna } from "@/types/columnas";
import { ValidacionFrontend } from "@/utils/validacion-frontend";
import { formatearRutEnInput } from "@/utils/rutUtils";

// Componente RutInput separado para evitar re-creación
const RutInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className: string;
  placeholder?: string;
  maxLength?: number;
  title?: string;
}> = ({ value, onChange, disabled, className, placeholder, maxLength, title }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const nuevoValor = input.value;
    const posicionCursor = input.selectionStart || 0;
    
    // Formatear el RUT
    const { valorFormateado, nuevaPosicion } = formatearRutEnInput(nuevoValor, posicionCursor);
    
    // Actualizar el valor
    onChange(valorFormateado);
    
    // Programar la restauración del cursor
    setTimeout(() => {
      if (input && document.activeElement === input) {
        input.setSelectionRange(nuevaPosicion, nuevaPosicion);
      }
    }, 0);
  };
  
  return (
    <input
      ref={inputRef}
      type="text"
      value={value || ""}
      onChange={handleChange}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      maxLength={maxLength}
      title={title}
    />
  );
};

/**
 * Renderiza un campo de entrada según el tipo de columna
 */
export const renderCampoInput = (
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
      // Verificar si es un campo RUT para aplicar formateo automático
      const esRUT = ValidacionFrontend.debeFormatearRut(columna);
      
      if (esRUT) {
        return (
          <RutInput
            value={valor}
            onChange={onChange}
            disabled={disabled}
            className={baseClassName}
            placeholder={
              columna.placeholder ||
              columna.valorPorDefecto ||
              "Ej: 12.345.678-9"
            }
            maxLength={12} // Formato completo: XX.XXX.XXX-X
            title="RUT chileno (se formatea automáticamente)"
          />
        );
      }
      
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
            columna.tipoValidacion === "regex" ? columna.validacion : undefined
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

/**
 * Muestra el valor de un campo formateado según su tipo
 */
export const mostrarValorCampo = (
  columna: DiccionarioColumna,
  valor: string
) => {
  if (!valor) return "-";

  // Usar el formateo de preview que incluye RUT
  return ValidacionFrontend.formatearValorParaPreview(valor, columna);
};
