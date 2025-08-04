import React, { useState, useCallback, type JSX } from "react";
import { FileUp, AlertCircle, CheckCircle, Clock, X } from "lucide-react";
import { personaComunidadService } from "../services/persona-comunidad.service";
import { PersonaComunidadTemporalService } from "../services/persona-comunidad-temporal.service";
import { PreviewCargaMasiva } from "./PreviewCargaMasiva";
import type { ProgresoCarga } from "../services/persona-comunidad.service";

interface CargaMasivaProps {
  onCargaCompleta?: () => void;
}

export const CargaMasiva = ({
  onCargaCompleta,
}: CargaMasivaProps): JSX.Element => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Renombrado para claridad
  const [error, setError] = useState<string | null>(null);

  // Estados para la previsualización
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [sesionId, setSesionId] = useState<string | null>(null);
  const [datosArchivo, setDatosArchivo] = useState<any[]>([]);

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
          const obj: any = {};

          headers.forEach((header, index) => {
            obj[header] = values[index] || "";
          });

          datosParseados.push(obj);
        }
      } else if (file.name.toLowerCase().endsWith(".json")) {
        // Procesar JSON
        try {
          const jsonData = JSON.parse(fileContent);
          datosParseados = Array.isArray(jsonData) ? jsonData : [jsonData];
        } catch (jsonError) {
          throw new Error("El archivo JSON no tiene un formato válido");
        }
      } else {
        throw new Error(
          "Formato de archivo no soportado. Solo se permiten archivos CSV y JSON."
        );
      }

      if (datosParseados.length === 0) {
        throw new Error("No se encontraron datos válidos en el archivo");
      }

      console.log("Datos parseados:", datosParseados.length, "registros");
      setDatosArchivo(datosParseados);

      // Enviar a procesamiento para previsualización
      const response =
        await PersonaComunidadTemporalService.procesarDatosParaPreview(
          datosParseados
        );

      if (response.success) {
        console.log("Previsualización creada exitosamente:", response.data);
        setSesionId(response.data.sesionId);
        setMostrarPreview(true);
        setIsProcessing(false);
      } else {
        throw new Error("Error al procesar datos para previsualización");
      }
    } catch (err: any) {
      console.error("Error al procesar archivo:", err);
      setError(err.message || "Error al procesar el archivo");
      setIsProcessing(false);
    }
  };

  // Manejar drag and drop
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
    if (
      droppedFile &&
      (droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".xlsx"))
    ) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Por favor selecciona un archivo CSV o Excel");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  // Confirmar carga definitiva desde previsualización
  const handleConfirmarCarga = async () => {
    if (!sesionId) return;

    try {
      setIsUploading(true);
      setMostrarPreview(false);

      console.log("Iniciando carga definitiva con sesión:", sesionId);

      // Iniciar la carga definitiva
      const response =
        await PersonaComunidadTemporalService.confirmarCargaDefinitiva(
          sesionId
        );

      if (response.success) {
        console.log("Carga definitiva completada:", response.data);

        // Simular progreso completado
        setProgreso({
          jobId: sesionId, // Usar sesionId como jobId
          status: "completed",
          progreso: {
            procesados: response.data.creados + response.data.actualizados,
            total: response.data.creados + response.data.actualizados,
            porcentaje: 100,
          },
          errores: response.data.errores,
        });

        // Limpiar estados después de 3 segundos
        setTimeout(() => {
          resetUpload();
          onCargaCompleta?.();
        }, 3000);
      } else {
        throw new Error("Error al iniciar la carga definitiva");
      }
    } catch (err: any) {
      console.error("Error al confirmar carga:", err);
      setError(err.message || "Error al confirmar la carga");
      setIsUploading(false);
      setMostrarPreview(true); // Volver a mostrar preview en caso de error
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
    }

    // Limpiar estados
    setMostrarPreview(false);
    setSesionId(null);
    setDatosArchivo([]);
    setFile(null);
    setError(null);
  };

  const resetUpload = () => {
    setFile(null);
    setJobId(null);
    setProgreso(null);
    setError(null);
    setIsProcessing(false);
    setIsUploading(false);
    setMostrarPreview(false);
    setSesionId(null);
    setDatosArchivo([]);
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

    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Procesando Carga Masiva
          </h3>
          <button
            onClick={resetUpload}
            className="text-gray-500 hover:text-gray-700"
            disabled={currentProgreso.status === "processing"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Estado */}
          <div className="flex items-center space-x-2">
            {currentProgreso.status === "processing" && (
              <>
                <Clock className="h-5 w-5 text-blue-500 animate-spin" />
                <span className="text-blue-600 font-medium">Procesando...</span>
              </>
            )}
            {currentProgreso.status === "completed" && (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-600 font-medium">
                  ¡Carga completada!
                </span>
              </>
            )}
            {currentProgreso.status === "failed" && (
              <>
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-600 font-medium">Carga fallida</span>
              </>
            )}
          </div>

          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Progreso: {currentProgreso.progreso?.procesados || 0} /{" "}
                {currentProgreso.progreso?.total || 0} registros
              </span>
              <span>{currentProgreso.progreso?.porcentaje || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentProgreso.status === "completed"
                    ? "bg-green-500"
                    : currentProgreso.status === "failed"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
                style={{
                  width: `${currentProgreso.progreso?.porcentaje || 0}%`,
                }}
              />
            </div>
          </div>

          {/* Errores si los hay */}
          {currentProgreso.errores && currentProgreso.errores.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Errores encontrados:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {currentProgreso.errores.slice(0, 5).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
                {currentProgreso.errores.length > 5 && (
                  <li className="text-red-600">
                    ... y {currentProgreso.errores.length - 5} errores más
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Carga Masiva de Datos
      </h3>

      {/* Zona de drop */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FileUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />

        {!file ? (
          <>
            <p className="text-lg font-medium text-gray-600 mb-2">
              Arrastra tu archivo aquí o haz click para seleccionar
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Formatos soportados: CSV, Excel (.xlsx)
            </p>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
            >
              Seleccionar Archivo
            </label>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-600 font-medium">{file.name}</span>
            </div>

            <div className="flex space-x-2 justify-center">
              <button
                onClick={handleFileUpload}
                disabled={isProcessing}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <FileUp className="h-4 w-4" />
                    <span>Previsualizar Carga</span>
                  </>
                )}
              </button>

              <button
                onClick={resetUpload}
                disabled={isProcessing}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          Proceso de carga:
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • <strong>1. Previsualización:</strong> Revisa los datos que se
            cargarán antes de confirmar
          </li>
          <li>
            • <strong>2. Validación:</strong> Se identifican errores y datos
            duplicados
          </li>
          <li>
            • <strong>3. Corrección:</strong> Edita los datos con errores antes
            de la carga final
          </li>
          <li>
            • <strong>4. Confirmación:</strong> Carga definitiva solo de datos
            válidos
          </li>
        </ul>
        <div className="mt-3 pt-3 border-t border-blue-200">
          <h5 className="text-xs font-medium text-blue-800 mb-1">
            Formatos soportados:
          </h5>
          <p className="text-xs text-blue-600">
            CSV y JSON • Tamaño máximo: 50MB
          </p>
        </div>
      </div>
    </div>
  );
};
