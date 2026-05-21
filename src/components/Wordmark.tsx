import { db } from "@/lib/db";

export function Wordmark({ subtle = false }: { subtle?: boolean }) {
  return (
    <div>
      <h1
        className={
          subtle
            ? "font-serif text-2xl tracking-tight text-stone-900"
            : "font-serif text-4xl tracking-tight text-stone-900"
        }
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Showline
      </h1>
      <div className={subtle ? "mt-1 h-px w-8 bg-green-700" : "mt-1 h-px w-12 bg-green-700"} />
      {!subtle && (
        <p className="mt-3 text-sm text-stone-600">{db.meta.tagline}</p>
      )}
    </div>
  );
}
