import React, { useState, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { personaComunidadService } from "@/services/persona-comunidad.service";
import { PersonaComunidadTemporalService } from "@/services/persona-comunidad-temporal.service";
import PreviewCargaMasiva from "@/components/PreviewCargaMasiva";
import { FileUploadZone } from "./FileUploadZone";
import { ProgressDisplay } from "./ProgressDisplay";
import type { ProgresoCarga } from "@/services/persona-comunidad.service";

interface CargaMasivaProps {
  onCargaCompleta?: () => void;
}

const CargaMasiva: React.FC<CargaMasivaProps> = ({ onCargaCompleta }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para la previsualización
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [sesionId, setSesionId] = useState<string | null>(null);

  // Estados para la carga definitiva
  const [isUploading, setIsUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<ProgresoCarga | null>(null);

  // Polling del progreso
  const checkProgress = useCallback(
    async (currentJobId: string) => {
      try {
        console.log("Consultando progreso para jobId:", currentJobId);
        const response = await personaComunidadService.consultarProgresoCarga(
          currentJobId
        );
        console.log("Progreso recibido:", response);
        setProgreso(response);

        if (response.status === "processing") {
          // Continuar polling cada 2 segundos
          setTimeout(() => checkProgress(currentJobId), 2000);
        } else if (response.status === "completed") {
          console.log("Carga completada exitosamente");
          // Carga completada
          setTimeout(() => {
            setJobId(null);
            setProgreso(null);
            setFile(null);
            onCargaCompleta?.();
          }, 3000); // Mostrar éxito por 3 segundos
        } else if (response.status === "failed") {
          console.error("Carga falló:", response.errores);
          // Error en la carga
          setError("La carga falló. Revise los errores en el historial.");
        }
      } catch (err: any) {
        console.error("Error al consultar progreso:", err);
        console.error("Error response:", err.response);
        setError(
          "Error al consultar el progreso de la carga: " +
            (err.response?.data?.error || err.message)
        );
      }
    },
    [onCargaCompleta]
  );

  // Procesar archivo para previsualización
  const handleFileUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      console.log("Procesando archivo para previsualización:", file.name);

      // Leer el archivo como texto
      const fileContent = await file.text();

      // Procesar según el tipo de archivo
      let datosParseados: any[] = [];

      if (file.name.toLowerCase().endsWith(".csv")) {
        // Procesar CSV
        const lines = fileContent.split("\n").filter((line) => line.trim());
        if (lines.length === 0) {
          throw new Error("El archivo CSV está vacío");
        }

        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().replace(/"/g, ""));

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]
            .split(",")
            .map((v) => v.trim().replace(/"/g, ""));

          if (values.length === headers.length) {
            const rowData: any = {};
            headers.forEach((header, index) => {
              rowData[header] = values[index] || "";
            });
            datosParseados.push(rowData);
          }
        }
      } else {
        throw new Error("Formato de archivo no soportado. Use CSV por ahora.");
      }

      console.log("Datos parseados:", datosParseados.slice(0, 3));

      // Enviar a procesamiento temporal
      const response =
        await PersonaComunidadTemporalService.procesarDatosParaPreview(
          datosParseados,
          sesionId || undefined
        );

      console.log("Respuesta del procesamiento temporal:", response);

      if (response.success && response.data.sesionId) {
        setSesionId(response.data.sesionId);
        setMostrarPreview(true);
        setError(null);
      } else {
        throw new Error("Error al procesar el archivo en el servidor");
      }
    } catch (err: any) {
      console.error("Error procesando archivo:", err);
      setError(err.message || "Error al procesar el archivo");
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirmar carga definitiva
  const handleConfirmarCarga = async () => {
    if (!sesionId) return;

    setIsUploading(true);
    setMostrarPreview(false);

    try {
      console.log("Iniciando carga definitiva para sesión:", sesionId);
      const response =
        await PersonaComunidadTemporalService.confirmarCargaDefinitiva(
          sesionId
        );
      console.log("Respuesta confirmación carga:", response);

      if (response.success) {
        console.log("Carga definitiva completada:", response.data);

        // Simular progreso completado usando sesionId como jobId
        setJobId(sesionId);
        setProgreso({
          jobId: sesionId,
          status: "completed",
          progreso: {
            total: response.data.creados + response.data.actualizados,
            procesados: response.data.creados + response.data.actualizados,
            porcentaje: 100,
          },
          errores: response.data.errores,
        });

        // Mostrar mensaje de éxito
        setError(null);
      } else {
        throw new Error("Error al iniciar la carga masiva");
      }
    } catch (err: any) {
      console.error("Error al confirmar carga:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Error al confirmar la carga masiva"
      );
      setIsUploading(false);
    }
  };

  // Cancelar previsualización
  const handleCancelarPreview = async () => {
    try {
      if (sesionId) {
        await PersonaComunidadTemporalService.cancelarPreview(sesionId);
      }
    } catch (err) {
      console.warn("Error al cancelar preview:", err);
    } finally {
      setSesionId(null);
      setMostrarPreview(false);
    }
  };

  // Reset de la carga
  const resetUpload = () => {
    setJobId(null);
    setProgreso(null);
    setIsUploading(false);
    setError(null);
    setFile(null);
    setSesionId(null);
    setMostrarPreview(false);
  };

  // Handlers para drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Validar tipo de archivo
    const allowedTypes = [".csv", ".xlsx", ".xls"];
    const fileExtension = selectedFile.name.toLowerCase().split(".").pop();

    if (!allowedTypes.some((type) => type.includes(fileExtension || ""))) {
      setError("Formato de archivo no soportado. Use CSV, Excel (.xlsx, .xls)");
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("El archivo es demasiado grande. Máximo 10MB permitido.");
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  // Si se está mostrando la previsualización
  if (mostrarPreview && sesionId) {
    return (
      <PreviewCargaMasiva
        sesionId={sesionId}
        onConfirmarCarga={handleConfirmarCarga}
        onCancelar={handleCancelarPreview}
      />
    );
  }

  // Si hay un job en progreso o carga en proceso, mostrar el estado
  if ((jobId && progreso) || isUploading) {
    // Crear un progreso por defecto si estamos cargando pero no tenemos progreso aún
    const currentProgreso = progreso || {
      jobId: sesionId || "",
      status: "processing" as const,
      progreso: {
        total: 0,
        procesados: 0,
        porcentaje: 0,
      },
      errores: [],
    };

    return <ProgressDisplay progreso={currentProgreso} onReset={resetUpload} />;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Carga Masiva de Datos
      </h3>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-800 mt-2 underline"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Zona de carga de archivos */}
      <FileUploadZone
        file={file}
        isDragging={isDragging}
        isProcessing={isProcessing}
        onFileSelect={file ? handleFileUpload : handleFileSelect}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />

      {/* Información adicional */}
      <div className="mt-6 text-sm text-gray-600 space-y-2">
        <h4 className="font-medium text-gray-800">Instrucciones:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>
            El archivo debe contener las columnas configuradas en el diccionario
          </li>
          <li>La primera fila debe contener los nombres de las columnas</li>
          <li>Máximo 50MB de tamaño por archivo</li>
          <li>Se mostrará una previsualización antes de confirmar la carga</li>
        </ul>
      </div>
    </div>
  );
};

export default CargaMasiva;
