import React from "react";
import { Clock, CheckCircle, AlertCircle, X } from "lucide-react";
import type { ProgresoCarga } from "@/services/persona-comunidad.service";

interface ProgressDisplayProps {
  progreso: ProgresoCarga;
  onReset: () => void;
}

export const ProgressDisplay: React.FC<ProgressDisplayProps> = ({
  progreso,
  onReset,
}) => {
  const getStatusIcon = () => {
    switch (progreso.status) {
      case "processing":
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (progreso.status) {
      case "processing":
        return "Procesando...";
      case "completed":
        return "Completado";
      case "failed":
        return "Error";
      default:
        return "Iniciando...";
    }
  };

  const getStatusColor = () => {
    switch (progreso.status) {
      case "processing":
        return "text-blue-600";
      case "completed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const porcentaje = progreso.progreso?.porcentaje || 0;
  const procesados = progreso.progreso?.procesados || 0;
  const total = progreso.progreso?.total || 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Procesando Carga Masiva
        </h3>
        <button
          onClick={onReset}
          className="text-gray-500 hover:text-gray-700"
          disabled={progreso.status === "processing"}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Estado general */}
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          {progreso.jobId && (
            <span className="text-xs text-gray-500">Job: {progreso.jobId}</span>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="w-full">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progreso</span>
            <span>{porcentaje}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progreso.status === "completed"
                  ? "bg-green-500"
                  : progreso.status === "failed"
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${porcentaje}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>
              {procesados} de {total} registros procesados
            </span>
            {progreso.status === "processing" && <span>Procesando...</span>}
          </div>
        </div>

        {/* Detalles adicionales */}
        {progreso.status === "completed" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Carga completada exitosamente
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Se procesaron {procesados} registros correctamente.
            </p>
          </div>
        )}

        {progreso.status === "failed" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Error en la carga
              </span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              La carga masiva ha fallado. Revise los errores abajo.
            </p>
          </div>
        )}

        {/* Errores si los hay */}
        {progreso.errores && progreso.errores.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-red-800 mb-2">
              Errores encontrados ({progreso.errores.length}):
            </h4>
            <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
              {progreso.errores.slice(0, 10).map((error, index) => (
                <li key={index} className="flex items-start space-x-1">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
              {progreso.errores.length > 10 && (
                <li className="text-red-600 font-medium">
                  ... y {progreso.errores.length - 10} errores más
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
