import { AlertCircle } from "lucide-react";

interface LoadingStateProps {
  loading: boolean;
}

interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

export const LoadingState = ({ loading }: LoadingStateProps) => {
  if (!loading) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  if (!error) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-medium mb-2">
          Error al cargar el historial
        </p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
};
