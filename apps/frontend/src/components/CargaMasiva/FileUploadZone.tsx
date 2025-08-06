import React from 'react';
import { FileUp } from 'lucide-react';

interface FileUploadZoneProps {
  file: File | null;
  isDragging: boolean;
  isProcessing: boolean;
  onFileSelect: (file: File) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  file,
  isDragging,
  isProcessing,
  onFileSelect,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging
          ? "border-blue-400 bg-blue-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <FileUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />

      {!file ? (
        <>
          <p className="text-lg font-medium text-gray-600 mb-2">
            Arrastra tu archivo aquí o haz click para seleccionar
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Formatos soportados: CSV, Excel (.xlsx, .xls)
          </p>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInputChange}
            className="hidden"
            id="file-input"
            disabled={isProcessing}
          />
          <label
            htmlFor="file-input"
            className={`inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Seleccionar archivo
          </label>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              ✓ Archivo seleccionado
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-800">{file.name}</p>
            <p className="text-sm text-gray-600">
              Tamaño: {(file.size / 1024).toFixed(1)} KB
            </p>
            <p className="text-sm text-gray-600">
              Tipo: {file.type || 'No especificado'}
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onFileSelect(file)}
              disabled={isProcessing}
              className={`flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>📊</span>
                  <span>Procesar Archivo</span>
                </>
              )}
            </button>
            
            <label
              htmlFor="file-input"
              className={`bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Cambiar
            </label>
          </div>

          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInputChange}
            className="hidden"
            id="file-input"
            disabled={isProcessing}
          />
        </div>
      )}
    </div>
  );
};
