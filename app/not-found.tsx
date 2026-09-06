import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-20 sm:px-6 text-center">
      <p className="text-sm font-medium text-emerald-600">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-gray-600">
        The page you tried to open does not exist or has moved. Start from the
        homepage or pick a destination below.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Home
        </Link>
        <Link
          href="/esim/japan"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-500"
        >
          Compare eSIM plans for Japan
        </Link>
      </div>
    </main>
  );
}