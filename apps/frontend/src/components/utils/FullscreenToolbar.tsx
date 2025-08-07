import React from 'react';
import { Minimize2 } from 'lucide-react';

interface FullscreenToolbarProps {
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
}

export const FullscreenToolbar: React.FC<FullscreenToolbarProps> = ({
  title,
  onClose,
  children,
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-900 text-white px-6 py-3 flex items-center justify-between z-50 shadow-lg">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-gray-300">Modo Pantalla Completa</span>
      </div>
      
      <div className="flex items-center space-x-4">
        {children}
        
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <span>Presiona</span>
          <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">ESC</kbd>
          <span>para salir</span>
        </div>
        
        <button
          onClick={onClose}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          title="Salir de pantalla completa"
        >
          <Minimize2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
