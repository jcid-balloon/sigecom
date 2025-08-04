import React, { useState } from "react";
import { Filter, UploadCloud, Save, CheckCircle } from "lucide-react";
import { mockDataDictionary } from "../../utils/mocks";

type PreviewRow = {
  rut: string;
  nombre: string;
  territorio: string;
  tipo: string;
  email: string;
  [key: string]: string;
};

type ValidationErrors = {
  [rowIndex: number]: {
    [column: string]: string;
  };
};

const UploadData: React.FC = () => {
  const [step, setStep] = useState<"upload" | "preview" | "success">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileDescription, setFileDescription] = useState<string>("");
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const validateData = (data: PreviewRow[]): ValidationErrors => {
    const errors: ValidationErrors = {};
    const rutRule = mockDataDictionary.find((d) => d.columna === "rut");
    const territorioRule = mockDataDictionary.find(
      (d) => d.columna === "territorio"
    );
    const rutRegex = rutRule ? new RegExp(rutRule.validacion || "") : /.*/;

    data.forEach((row, rowIndex) => {
      if (!rutRegex.test(row.rut)) {
        if (!errors[rowIndex]) errors[rowIndex] = {};
        errors[rowIndex].rut = "RUT con formato inválido.";
      }
      if (
        territorioRule &&
        !territorioRule.opciones?.includes(row.territorio)
      ) {
        if (!errors[rowIndex]) errors[rowIndex] = {};
        errors[rowIndex].territorio = "Territorio no existe en el diccionario.";
      }
    });
    return errors;
  };

  const handleValidate = () => {
    if (!file && !fileUrl) {
      alert("Por favor, sube un archivo o ingresa una URL.");
      return;
    }
    // Simulate reading a CSV and validating
    const mockFileData: PreviewRow[] = [
      {
        rut: "88.888.888-8",
        nombre: "Juan Pérez",
        territorio: "Araucanía",
        tipo: "Emprendedor",
        email: "juan.perez@test.com",
      },
      {
        rut: "99.999.999-K",
        nombre: "Maria López",
        territorio: "Biobio",
        tipo: "Líder Comunitario",
        email: "maria@test.com",
      }, // Error simulado
      {
        rut: "12345678-9",
        nombre: "Pedro Gomez",
        territorio: "Los Lagos",
        tipo: "Ambos",
        email: "pedro.gomez@test.com",
      }, // Error simulado
    ];

    const errors = validateData(mockFileData);
    setPreviewData(mockFileData);
    setValidationErrors(errors);
    setStep("preview");
  };

  const handleCellEdit = (rowIndex: number, column: string, value: string) => {
    const newData = [...previewData];
    newData[rowIndex][column] = value;
    setPreviewData(newData);
    // Re-validate on change
    const newErrors = validateData(newData);
    setValidationErrors(newErrors);
  };

  const handleSave = () => {
    if (Object.keys(validationErrors).length > 0) {
      alert("Aún hay errores por corregir.");
      return;
    }
    setStep("success");
  };

  const resetFlow = () => {
    setStep("upload");
    setFile(null);
    setFileName("");
    setFileUrl("");
    setFileDescription("");
    setPreviewData([]);
    setValidationErrors({});
  };

  if (step === "success") {
    return (
      <div className="text-center p-10 bg-white rounded-xl shadow-md">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-800">
          ¡Información Cargada!
        </h2>
        <p className="mt-2 text-gray-600">
          Los datos han sido validados y almacenados correctamente en la base de
          datos.
        </p>
        <button
          onClick={resetFlow}
          className="mt-6 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Cargar otro archivo
        </button>
      </div>
    );
  }

  if (step === "preview") {
    const hasErrors = Object.keys(validationErrors).length > 0;
    return (
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Previsualización y Edición
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Se han detectado {Object.keys(validationErrors).length} filas con
          errores. Edita los campos en rojo para corregirlos.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(previewData[0]).map((header) => (
                  <th
                    key={header}
                    className="py-2 px-3 text-left font-medium text-gray-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {previewData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.entries(row).map(([key, value]) => {
                    const hasError =
                      validationErrors[rowIndex] &&
                      validationErrors[rowIndex][key];
                    return (
                      <td
                        key={key}
                        className={`p-0 ${hasError ? "bg-red-50" : ""}`}
                      >
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            handleCellEdit(rowIndex, key, e.target.value)
                          }
                          className={`w-full h-full p-2 bg-transparent border-0 focus:ring-2 ${
                            hasError
                              ? "focus:ring-red-500"
                              : "focus:ring-blue-500"
                          } rounded-none`}
                        />
                        {hasError && (
                          <div className="text-red-600 text-xs p-1">
                            {validationErrors[rowIndex][key]}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={resetFlow}
            className="w-full sm:w-auto bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
          >
            Recargar Archivo
          </button>
          <button
            onClick={handleSave}
            disabled={hasErrors}
            className={`w-full sm:w-auto font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
              hasErrors
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            <Save className="inline-block mr-2 h-4 w-4" />
            {hasErrors
              ? "Corregir errores para guardar"
              : "Almacenar Información"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Carga de Información</h1>
      <div className="bg-white p-4 sm:p-8 rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Columna 1: Carga de Archivos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-700">
              1. Cargar Archivo
            </h3>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Nombre del archivo
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Ej: emprendedores_q1_2024.csv"
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Descripción
              </label>
              <textarea
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                rows={2}
                placeholder="Breve descripción del contenido del archivo"
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
              ></textarea>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                URL del archivo (Google Sheets)
              </label>
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="text-center text-gray-500 my-2">o</div>
            <div>
              <label
                htmlFor="file-upload"
                className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <UploadCloud className="h-10 w-10 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">
                  {file ? file.name : "Sube un archivo (CSV, XLSX)"}
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                />
              </label>
            </div>
          </div>
          {/* Columna 2: Diccionario y Validación */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-700">
              2. Diccionario de Datos
            </h3>
            <p className="text-sm text-gray-600">
              El sistema validará el archivo contra las siguientes reglas.
              Puedes gestionar el diccionario en{" "}
              <span className="font-semibold">Configuración</span>.
            </p>
            <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
              {mockDataDictionary.map((rule) => (
                <div
                  key={rule.id}
                  className="text-sm py-1 border-b border-gray-100 last:border-b-0"
                >
                  <span className="font-semibold text-gray-800">
                    {rule.columna}
                  </span>
                  <span className="text-gray-500 ml-2">
                    ({rule.tipo_dato}
                    {rule.requerido ? ", requerido" : ""})
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={handleValidate}
              className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Filter className="mr-2 h-5 w-5" />
              Validar Archivo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadData;
