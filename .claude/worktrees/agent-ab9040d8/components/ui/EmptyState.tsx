import type { ElementType } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: ElementType;
  label: string;
  colSpan?: number;
}

export default function EmptyState({ icon: Icon = Inbox, label, colSpan = 6 }: EmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center text-secondary-400">
        <Icon size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">{label}</p>
      </td>
    </tr>
  );
}
