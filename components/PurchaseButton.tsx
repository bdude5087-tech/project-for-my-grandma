import { buildPurchaseLink } from "@/lib/affiliate";

/** Outbound purchase button. Renders nothing when the provider has no configured URL. */
export default function PurchaseButton({
  providerName,
  size = "md",
}: {
  providerName: string;
  size?: "sm" | "md";
}) {
  const link = buildPurchaseLink(providerName);
  if (!link) return null;

  const base =
    size === "sm"
      ? "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold"
      : "inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold";

  return (
    <a
      href={link.href}
      target="_blank"
      rel={link.rel}
      className={`${base} ${
        link.sponsored
          ? "bg-emerald-600 text-white transition hover:bg-emerald-700"
          : "border border-gray-300 text-gray-700 transition hover:border-gray-500"
      }`}
    >
      {link.label}
      {link.sponsored && (
        <span
          className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          title="Affiliate link — may earn us a commission at no cost to you"
        >
          Affiliate
        </span>
      )}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
      >
        <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}