export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="flex flex-col gap-4">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-3xl text-lg leading-8 text-muted">{description}</p>
      ) : null}
    </header>
  );
}
