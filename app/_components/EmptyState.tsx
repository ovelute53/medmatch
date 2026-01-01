interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

export default function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
      <div className="text-6xl mb-5">{icon}</div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-8 text-base">{description}</p>}
      {action && (
        <a
          href={action.href}
          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}

