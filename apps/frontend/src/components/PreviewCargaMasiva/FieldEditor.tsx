import type { DiccionarioColumna } from "@/types/columnas";

interface FieldEditorProps {
  columna: DiccionarioColumna;
  valor: string;
  onChange: (valor: string) => void;
  hasError?: boolean;
}

export const FieldEditor = ({
  columna,
  valor,
  onChange,
  hasError,
}: FieldEditorProps) => {
  const baseClassName = `px-2 py-1 border rounded text-sm ${
    hasError
      ? "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500"
      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
  } focus:ring-1 focus:outline-none`;

  const baseStyle = { width: "230px", minWidth: "230px" };

  switch (columna.tipo) {
    case "select":
      let opciones: string[] = [];
      if (columna.validacion) {
        try {
          opciones = JSON.parse(columna.validacion);
        } catch {
          opciones = columna.validacion.split(",").map((opt) => opt.trim());
        }
      }

      return (
        <select
          value={valor || ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseClassName}
          style={baseStyle}
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
          className={baseClassName}
          style={baseStyle}
          rows={2}
        />
      );

    case "boolean":
      return (
        <select
          value={valor || ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseClassName}
          style={baseStyle}
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
          className={baseClassName}
          style={baseStyle}
        />
      );

    case "number":
      return (
        <input
          type="number"
          value={valor || ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseClassName}
          style={baseStyle}
        />
      );

    case "email":
      return (
        <input
          type="email"
          value={valor || ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseClassName}
          style={baseStyle}
        />
      );

    default:
      return (
        <input
          type="text"
          value={valor || ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseClassName}
          style={baseStyle}
        />
      );
  }
};
