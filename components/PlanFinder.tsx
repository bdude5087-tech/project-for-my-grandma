"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { SearchIndexDestination } from "@/lib/data";
import {
  normalizeCountryQuery,
  suggestPlans,
  type FinderResult,
} from "@/lib/planfit";
import { formatDataGb, formatMoney, formatValidity } from "@/lib/format";

type DailyData = "light" | "1" | "2" | "3" | "5" | "unlimited";

const DATA_OPTIONS: { value: DailyData; label: string; perDayGb: number | null }[] = [
  { value: "light", label: "Less than 1 GB", perDayGb: 0.5 },
  { value: "1", label: "1 GB", perDayGb: 1 },
  { value: "2", label: "2 GB", perDayGb: 2 },
  { value: "3", label: "3 GB", perDayGb: 3 },
  { value: "5", label: "5 GB", perDayGb: 5 },
  { value: "unlimited", label: "Unlimited", perDayGb: null },
];

const QUICK_PICKS = [
  { code: "JP", label: "Japan" },
  { code: "US", label: "USA" },
  { code: "GB", label: "UK" },
  { code: "TH", label: "Thailand" },
  { code: "IT", label: "Italy" },
  { code: "ES", label: "Spain" },
];

function planChips(p: FinderResult["suggestions"][number]) {
  const chips: { key: string; text: string; tone: "good" | "neutral" | "warn" }[] = [
    {
      key: "data",
      text: formatDataGb(p.plan.data_gb, p.plan.unlimited),
      tone: p.coversData ? "good" : "warn",
    },
    {
      key: "validity",
      text: formatValidity(p.plan.validity_days),
      tone: p.coversValidity ? "good" : "warn",
    },
    {
      key: "network",
      text: p.plan.network || "Network",
      tone: "neutral",
    },
    {
      key: "price",
      text: formatMoney(p.plan.price, p.plan.currency),
      tone: p.withinBudget ? "neutral" : "warn",
    },
  ];
  return chips;
}

const chipStyles = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-800",
  neutral: "border-gray-200 bg-gray-50 text-gray-700",
  warn: "border-amber-200 bg-amber-50 text-amber-800",
} as const;

export default function PlanFinder({
  destinations,
}: {
  destinations: SearchIndexDestination[];
}) {
  const [country, setCountry] = useState("");
  const [dailyData, setDailyData] = useState<DailyData>("1");
  const [days, setDays] = useState("7");
  const [maxPrice, setMaxPrice] = useState("");
  const [result, setResult] = useState<FinderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function runFor(code: string, inputValue = country) {
    const dest = destinations.find((d) => d.code === code);
    if (!dest) return;
    const need = {
      days: Math.min(365, Math.max(1, parseInt(days, 10) || 7)),
      dataPerDayGb:
        DATA_OPTIONS.find((o) => o.value === dailyData)?.perDayGb ?? 1,
      maxPrice: maxPrice.trim() === "" ? null : Number(maxPrice) || null,
    };
    setCountry(inputValue);
    setError(null);
    setResult({ destination: dest, ...suggestPlans(dest, need) });
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const dest = normalizeCountryQuery(country, destinations);
    if (!dest) {
      setResult(null);
      setError(
        "We don't cover that destination yet — right now we compare Japan, the USA, India, Thailand, Mexico, the UK, Italy, Vietnam, Spain, and France.",
      );
      return;
    }
    runFor(dest.code, country);
  }

  const tip = result
    ? result.relaxed
      ? "Top match doesn't fully fit every condition — relaxed to the closest available plans."
      : "These plans fit your destination, data, trip length, and budget."
    : null;

  return (
    <div className="w-full">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
          <div>
            <label
              htmlFor="finder-country"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Destination
            </label>
            <input
              id="finder-country"
              list="destinations-list"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Try Japan, USA, Thailand…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              autoComplete="off"
              required
            />
            <datalist id="destinations-list">
              {destinations.map((d) => (
                <option key={d.code} value={d.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label
              htmlFor="finder-data"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Data per day
            </label>
            <select
              id="finder-data"
              value={dailyData}
              onChange={(e) => setDailyData(e.target.value as DailyData)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              {DATA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="finder-days"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Trip length
            </label>
            <div className="flex items-center gap-1">
              <input
                id="finder-days"
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <span className="text-sm text-gray-500">days</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="finder-budget"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Budget (optional)
            </label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">$</span>
              <input
                id="finder-budget"
                type="number"
                min={0}
                step={0.01}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Any"
                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-5 w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
        >
          Find my best plan
        </button>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="font-semibold uppercase tracking-wide">Popular:</span>
          {QUICK_PICKS.map((q) => (
            <button
              key={q.code}
              type="button"
              onClick={() => runFor(q.code, q.label)}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 font-medium text-gray-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800"
            >
              {q.label}
            </button>
          ))}
        </div>
      </form>

      <div aria-live="polite">
        {error && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {error}
          </p>
        )}

        {result &&
          result.destination &&
          result.suggestions.length > 0 && (
            <div className="mt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  Best plans for {result.destination.name}
                </h2>
                <Link
                  href={`/esim/${result.destination.slug}/`}
                  className="text-sm font-semibold text-emerald-700 hover:underline"
                >
                  View all {result.destination.plan_count}{" "}
                  {result.destination.name} plans &rarr;
                </Link>
              </div>

              {tip && (
                <p className="mt-1 text-sm text-gray-500">
                  {tip}{" "}
                  {!result.relaxed &&
                    `Matched ${result.matchedCount} of ${result.totalPlans} plans.`}
                </p>
              )}

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {result.suggestions.map((s, i) => (
                  <li
                    key={`${s.plan.provider}-${s.plan.plan_name}-${i}`}
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {s.plan.plan_name}
                        </p>
                        <p className="text-sm text-gray-500">{s.plan.provider}</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {formatMoney(s.plan.price, s.plan.currency)}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {planChips(s).map((c) => (
                        <span
                          key={c.key}
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${chipStyles[c.tone]}`}
                        >
                          {c.text}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/esim/${s.destination.slug}/`}
                      className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline"
                    >
                      Full comparison &rarr;
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {result &&
          result.destination &&
          result.suggestions.length === 0 && (
            <p className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              No plans found for {result.destination.name} with those filters.
              Try fewer constraints, then browse the full comparison page.
            </p>
          )}
      </div>
    </div>
  );
}