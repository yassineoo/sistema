import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  message = "Une erreur est survenue. Veuillez réessayer.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-6 py-5 text-red-700 ${className}`}>
      <AlertTriangle size={20} className="shrink-0" />
      <div>
        <p className="font-semibold">Erreur de chargement</p>
        <p className="text-sm opacity-80">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-auto rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
