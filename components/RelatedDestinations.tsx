import Link from "next/link";
import { getDestinationsConfig, getProcessedDestinations } from "@/lib/data";

export default function RelatedDestinations({ currentCode }: { currentCode: string }) {
  const config = getDestinationsConfig().filter((d) => d.code !== currentCode);
  const processed = getProcessedDestinations();
  const byCode = new Map(processed.map((d) => [d.country_code, d]));

  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-2xl font-semibold tracking-tight">
        Traveling somewhere else? Compare eSIM plans for:
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {config.map((dest) => {
          const p = byCode.get(dest.code);
          return (
            <li key={dest.code}>
              <Link
                href={`/esim/${dest.slug}`}
                className="block rounded-lg border border-gray-200 p-4 transition hover:border-gray-400"
              >
                <span className="font-medium text-gray-900">{dest.name}</span>
                {p && (
                  <span className="mt-1 block text-xs text-gray-500">
                    {p.plan_count} plans compared
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}