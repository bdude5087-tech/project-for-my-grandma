import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

const NAV = [
  { href: "/all-locations/", label: "All destinations" },
  { href: "/how-we-rank/", label: "How we rank" },
  { href: "/about/", label: "About" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-gray-900"
        >
          {SITE_NAME}
          <span className="text-emerald-700">.</span>
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-600 transition hover:text-emerald-800"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}