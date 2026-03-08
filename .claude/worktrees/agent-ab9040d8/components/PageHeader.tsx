import { type LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-secondary-100 bg-white px-4 py-4 sm:px-8 sm:py-5">
      <div className="flex flex-1 items-center gap-3 min-w-0">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 sm:h-10 sm:w-10">
            <Icon size={18} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-secondary-900 sm:text-lg">{title}</h1>
          {subtitle && <p className="hidden text-sm text-secondary-400 sm:block">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
