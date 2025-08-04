import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  tooltipMode?: boolean; // Nueva prop para el modo tooltip
  mousePosition?: { x: number; y: number }; // Posición del mouse para el tooltip
}

const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  tooltipMode = false,
  mousePosition,
}) => {
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (tooltipMode && mousePosition && isOpen) {
      // Calcular posición del tooltip basada en la posición del mouse
      const offset = 15; // Offset desde el mouse
      const tooltipWidth = 320; // Ancho estimado del tooltip
      const tooltipHeight = 150; // Alto estimado del tooltip

      let x = mousePosition.x + offset;
      let y = mousePosition.y + offset;

      // Ajustar si el tooltip se sale de la ventana por la derecha
      if (x + tooltipWidth > window.innerWidth) {
        x = mousePosition.x - tooltipWidth - offset;
      }

      // Ajustar si el tooltip se sale de la ventana por abajo
      if (y + tooltipHeight > window.innerHeight) {
        y = mousePosition.y - tooltipHeight - offset;
      }

      // Asegurar que no se salga por la izquierda o arriba
      x = Math.max(10, x);
      y = Math.max(10, y);

      setTooltipStyle({
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 10000,
      });
    }
  }, [tooltipMode, mousePosition, isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Solo cerrar al hacer click en el backdrop si no está en modo tooltip
    if (!tooltipMode && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (tooltipMode) {
    return createPortal(
      <div
        className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-sm w-80 pointer-events-none"
        style={{
          ...tooltipStyle,
          position: "fixed",
          pointerEvents: "none",
        }}
      >
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>

        <div className="p-3">
          <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
        </div>
      </div>,
      document.body
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[10000] p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
