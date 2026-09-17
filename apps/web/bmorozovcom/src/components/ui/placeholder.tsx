export function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted">
      {label}
    </div>
  );
}
