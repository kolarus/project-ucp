/** A labelled row of chips: the stack, or what runs it. */
export function ChipRow({
  label,
  items,
}: {
  label: string;
  items: readonly string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium tracking-wide text-muted uppercase">
        {label}
      </span>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
