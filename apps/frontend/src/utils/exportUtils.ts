import * as XLSX from "xlsx";
import type { PersonaComunidad } from "@/services/persona-comunidad.service";
import type { DiccionarioColumna } from "@/types/columnas";

/**
 * Convierte un array de personas a formato CSV
 */
export const convertirACSV = (
  datos: PersonaComunidad[],
  columnas: DiccionarioColumna[]
): string => {
  if (datos.length === 0) return "";

  const headers = columnas.map((col) => col.nombre);
  const csvHeaders = headers.join(",");

  const csvRows = datos.map((persona) => {
    return headers
      .map((header) => {
        const valor = persona.datosAdicionales?.[header] || "";
        // Escapar comillas y comas en CSV
        return `"${String(valor).replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  return [csvHeaders, ...csvRows].join("\n");
};

/**
 * Genera y descarga un archivo local
 */
export const generarArchivoLocal = (
  datos: PersonaComunidad[],
  columnas: DiccionarioColumna[],
  formato: string,
  nombreArchivo?: string
) => {
  if (formato === "CSV") {
    const csv = convertirACSV(datos, columnas);
    if (!csv) {
      alert("No hay datos para descargar");
      return;
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download =
      nombreArchivo ||
      `comunidad_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpiar la URL del blob
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
    }, 100);
  } else if (formato === "Excel") {
    if (datos.length === 0) {
      alert("No hay datos para descargar");
      return;
    }

    try {
      // Preparar datos para Excel
      const headers = columnas.map((col) => col.nombre);
      const excelData = datos.map((persona) => {
        const row: any = {};
        headers.forEach((header) => {
          const valor = persona.datosAdicionales?.[header] || "";
          // Formatear valores según el tipo de columna
          const columna = columnas.find((col) => col.nombre === header);
          if (columna?.tipo === "boolean") {
            row[header] =
              valor === "true" ? "Sí" : valor === "false" ? "No" : valor;
          } else if (columna?.tipo === "date" && valor) {
            try {
              row[header] = new Date(valor).toLocaleDateString();
            } catch {
              row[header] = valor;
            }
          } else {
            row[header] = valor;
          }
        });
        return row;
      });

      // Crear workbook y worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Ajustar ancho de columnas automáticamente
      const columnWidths = headers.map((header) => {
        const maxLength = Math.max(
          header.length,
          ...excelData.map((row) => String(row[header] || "").length)
        );
        return { wch: Math.min(maxLength + 2, 50) }; // Máximo 50 caracteres de ancho
      });
      worksheet["!cols"] = columnWidths;

      // Agregar hoja al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Comunidad");

      // Generar archivo y descargar
      const fileName =
        nombreArchivo ||
        `comunidad_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error al generar archivo Excel:", error);
      alert("Error al generar el archivo Excel. Intente con formato CSV.");
    }
  } else if (formato === "PDF") {
    // Por ahora, mostrar mensaje que PDF no está implementado
    alert(
      "La descarga en PDF estará disponible próximamente. Por favor use CSV o Excel."
    );
  } else {
    alert(`Formato ${formato} no soportado actualmente. Use CSV o Excel.`);
  }
};
