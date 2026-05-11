export function PageTitle({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}
