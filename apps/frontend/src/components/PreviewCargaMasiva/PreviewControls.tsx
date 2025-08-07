interface PreviewControlsProps {
  canConfirm: boolean;
  isConfirming: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const PreviewControls = ({
  canConfirm,
  isConfirming,
  onConfirmar,
  onCancelar,
}: PreviewControlsProps) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <button
          onClick={onCancelar}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50"
          disabled={isConfirming}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirmar}
          disabled={!canConfirm || isConfirming}
          className={`px-6 py-2 rounded-lg disabled:opacity-50 ${
            canConfirm
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-red-100 text-red-700 cursor-not-allowed"
          }`}
        >
          {isConfirming ? "Confirmando..." : "Confirmar Carga"}
        </button>
      </div>

      {!canConfirm && (
        <div className="mt-3 text-sm text-red-600 text-center">
          No se puede confirmar la carga mientras haya errores pendientes
        </div>
      )}
    </div>
  );
};
