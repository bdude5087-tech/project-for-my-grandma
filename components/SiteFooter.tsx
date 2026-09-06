import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/how-we-rank", label: "How we rank" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/affiliate-disclosure", label: "Affiliate disclosure" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <p className="text-sm font-semibold text-gray-900">{SITE_NAME}</p>
        <nav aria-label="Footer" className="mt-4">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-gray-500 transition hover:text-gray-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-6 text-xs text-gray-400">
          Independent eSIM price comparison. Rankings are data-driven and never
          influenced by advertising or affiliate relationships.
        </p>
      </div>
    </footer>
  );
}