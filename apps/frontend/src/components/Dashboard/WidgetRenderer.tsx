import React, { useState, useRef, useEffect } from 'react';
import { X, Edit3, Move } from 'lucide-react';
import type { Widget, DashboardData } from '@/types/dashboard';
import {
  CounterWidget,
  ChartBarWidget,
  ChartPieWidget,
  ProgressWidget
} from './widgets';

interface WidgetRendererProps {
  widget: Widget;
  data: DashboardData;
  onEdit?: (widget: Widget) => void;
  onDelete?: (widgetId: string) => void;
  onPositionChange?: (widgetId: string, position: { x: number; y: number; width: number; height: number }) => void;
  isEditing?: boolean;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widget,
  data,
  onEdit,
  onDelete,
  onPositionChange,
  isEditing = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && isEditing && widgetRef.current?.parentElement) {
        const container = widgetRef.current.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        const newX = Math.max(0, Math.min(
          e.clientX - containerRect.left - dragStart.x,
          containerRect.width - widget.position.width
        ));
        const newY = Math.max(0, Math.min(
          e.clientY - containerRect.top - dragStart.y,
          containerRect.height - widget.position.height
        ));
        
        const newPosition = {
          x: newX,
          y: newY,
          width: widget.position.width,
          height: widget.position.height
        };
        onPositionChange?.(widget.id, newPosition);
      } else if (isResizing && isEditing) {
        const newWidth = Math.max(250, resizeStart.width + (e.clientX - resizeStart.x));
        const newHeight = Math.max(200, resizeStart.height + (e.clientY - resizeStart.y));
        
        const newPosition = {
          x: widget.position.x,
          y: widget.position.y,
          width: newWidth,
          height: newHeight
        };
        onPositionChange?.(widget.id, newPosition);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, widget, onPositionChange, isEditing]);

  const renderWidget = () => {
    switch (widget.type) {
      case 'counter':
        return <CounterWidget widget={widget} data={data} />;
      case 'chart-bar':
        return <ChartBarWidget widget={widget} data={data} />;
      case 'chart-pie':
        return <ChartPieWidget widget={widget} data={data} />;
      case 'progress':
        return <ProgressWidget widget={widget} data={data} />;
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <p className="text-gray-500">Widget no reconocido: {widget.type}</p>
          </div>
        );
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const containerRect = widgetRef.current?.parentElement?.getBoundingClientRect();
    if (containerRect) {
      setDragStart({
        x: e.clientX - containerRect.left - widget.position.x,
        y: e.clientY - containerRect.top - widget.position.y
      });
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isEditing) return;
    
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: widget.position.width,
      height: widget.position.height
    });
  };

  const widgetStyle = {
    position: 'absolute' as const,
    left: widget.position.x,
    top: widget.position.y,
    width: widget.position.width,
    height: widget.position.height,
    zIndex: isDragging || isResizing ? 1000 : 1,
    cursor: isEditing ? (isDragging ? 'grabbing' : 'grab') : 'default',
    userSelect: 'none' as const
  };

  return (
    <div
      ref={widgetRef}
      style={widgetStyle}
      className={`transition-shadow duration-200 ${
        isEditing ? 'ring-2 ring-blue-200 hover:ring-blue-400' : ''
      } ${isDragging || isResizing ? 'ring-blue-500' : ''}`}
      onMouseDown={handleMouseDown}
    >
      {/* Controles de edición */}
      {isEditing && (
        <div className="absolute top-2 right-2 z-10 flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(widget);
            }}
            className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            title="Editar widget"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(widget.id);
            }}
            className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            title="Eliminar widget"
          >
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* Icono de arrastre */}
      {isEditing && (
        <div className="absolute top-2 left-2 z-10 text-gray-400 pointer-events-none">
          <Move size={16} />
        </div>
      )}
      
      {/* Contenido del widget */}
      <div className={`h-full w-full ${isEditing ? 'pointer-events-none' : ''}`}>
        {renderWidget()}
      </div>
      
      {/* Manejador de redimensionamiento */}
      {isEditing && (
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize z-20 opacity-70 hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeStart}
          style={{
            clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
          }}
          title="Redimensionar widget"
        />
      )}
    </div>
  );
};
