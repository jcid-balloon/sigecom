import { type JSX, type ReactNode } from "react";

interface CardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
}

export const Card = ({ title, value, icon, color }: CardProps): JSX.Element => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between gap-4">
    <div className="flex-grow min-w-0">
      <p className="text-sm text-gray-500 truncate">{title}</p>
      <p className="text-3xl font-bold text-gray-800 break-words">{value}</p>
    </div>
    <div className={`p-3 rounded-full ${color} flex-shrink-0`}>{icon}</div>
  </div>
);
