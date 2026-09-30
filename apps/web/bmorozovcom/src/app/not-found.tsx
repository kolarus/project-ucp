import { NotFoundView } from "@/views/not-found";

// `not-found.tsx` does not support a `metadata` export; only `global-not-found`
// does. The title falls back to the root layout default.
export default function NotFound() {
  return <NotFoundView />;
}
