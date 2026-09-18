import type { Language } from "@/config/contact";

/** Languages and the level I work in them. */
export function LanguageList({
  languages,
}: {
  languages: readonly Language[];
}) {
  return (
    <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
      {languages.map((language) => (
        <div key={language.name} className="flex flex-col gap-1">
          <dt className="text-base font-medium">{language.name}</dt>
          <dd className="text-sm text-muted">{language.level}</dd>
        </div>
      ))}
    </dl>
  );
}
