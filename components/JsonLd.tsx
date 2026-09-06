/** Renders a JSON-LD block as an application/ld+json script. Compact JSON prevents React hydration diffs. */
export default function JsonLd({ data }: { data: NonNullable<unknown> }) {
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}