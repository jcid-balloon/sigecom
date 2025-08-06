interface PreviewSummaryProps {
  resumen: {
    total: number;
    nuevos: number;
    actualizaciones: number;
    sinCambios: number;
    errores: number;
  };
}

export const PreviewSummary = ({ resumen }: PreviewSummaryProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-gray-800">{resumen.total}</div>
        <div className="text-sm text-gray-600">Total</div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-green-600">
          {resumen.nuevos}
        </div>
        <div className="text-sm text-green-700">Nuevos</div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-blue-600">
          {resumen.actualizaciones}
        </div>
        <div className="text-sm text-blue-700">Actualizaciones</div>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-gray-600">
          {resumen.sinCambios}
        </div>
        <div className="text-sm text-gray-700">Sin cambios</div>
      </div>
      <div className="bg-red-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-red-600">{resumen.errores}</div>
        <div className="text-sm text-red-700">Errores</div>
      </div>
    </div>
  );
};
