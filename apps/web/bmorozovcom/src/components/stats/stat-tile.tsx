import { formatCount } from "@/lib/format";

/** A single headline number with its label. */
export function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border px-5 py-4">
      <dt className="order-2 text-xs tracking-wide text-muted uppercase">
        {label}
      </dt>
      <dd className="order-1 text-2xl font-semibold tracking-tight">
        {formatCount(value)}
      </dd>
    </div>
  );
}
