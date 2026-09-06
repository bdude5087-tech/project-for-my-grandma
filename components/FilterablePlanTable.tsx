"use client";

import { useMemo, useState } from "react";
import { formatDataGb, formatMoney, formatValidity } from "@/lib/format";

export interface RowPlan {
  plan_name: string;
  provider: string;
  price: number;
  currency: string;
  data_gb: number | null;
  price_per_gb: number | null;
  unlimited: boolean;
  validity_days: number | null;
  network: string;
  hotspot: boolean;
  purchase?: {
    href: string;
    rel: string;
    sponsored: boolean;
    label: string;
  } | null;
}

type DataFilter = "all" | "unlimited" | "ge5" | "ge10";
type ValidityFilter = "all" | "le30" | "gt30";
type SortKey = "price" | "data" | "validity";

export default function FilterablePlanTable({
  plans,
  showPurchase = false,
}: {
  plans: RowPlan[];
  showPurchase?: boolean;
}) {
  const [dataFilter, setDataFilter] = useState<DataFilter>("all");
  const [validityFilter, setValidityFilter] = useState<ValidityFilter>("all");
  const [networkFilter, setNetworkFilter] = useState<"all" | "5g">("all");
  const [sort, setSort] = useState<SortKey>("price");

  const visible = useMemo(() => {
    let rows = plans.filter((p) => {
      if (networkFilter === "5g" && p.network !== "5G") return false;

      if (dataFilter === "unlimited" && !p.unlimited) return false;
      if (dataFilter === "ge5" && !p.unlimited && (p.data_gb ?? 0) < 5)
        return false;
      if (dataFilter === "ge10" && !p.unlimited && (p.data_gb ?? 0) < 10)
        return false;

      if (validityFilter === "le30" && (p.validity_days ?? 0) > 30) return false;
      if (validityFilter === "gt30" && (p.validity_days ?? 0) <= 30) return false;

      return true;
    });

    rows = [...rows].sort((a, b) => {
      if (sort === "price") return a.price - b.price;
      if (sort === "data") return (b.data_gb ?? -1) - (a.data_gb ?? -1);
      return (b.validity_days ?? -1) - (a.validity_days ?? -1);
    });
    return rows;
  }, [plans, dataFilter, validityFilter, networkFilter, sort]);

  const btn = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs font-medium transition ${
      active
        ? "bg-gray-900 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-500">Data</span>
          <button className={btn(dataFilter === "all")} onClick={() => setDataFilter("all")}>
            All
          </button>
          <button className={btn(dataFilter === "ge5")} onClick={() => setDataFilter("ge5")}>
            5GB+
          </button>
          <button className={btn(dataFilter === "ge10")} onClick={() => setDataFilter("ge10")}>
            10GB+
          </button>
          <button
            className={btn(dataFilter === "unlimited")}
            onClick={() => setDataFilter("unlimited")}
          >
            Unlimited
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-500">Validity</span>
          <button className={btn(validityFilter === "all")} onClick={() => setValidityFilter("all")}>
            Any
          </button>
          <button
            className={btn(validityFilter === "le30")}
            onClick={() => setValidityFilter("le30")}
          >
            30 days max
          </button>
          <button
            className={btn(validityFilter === "gt30")}
            onClick={() => setValidityFilter("gt30")}
          >
            30 days+
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-500">Network</span>
          <button className={btn(networkFilter === "all")} onClick={() => setNetworkFilter("all")}>
            All
          </button>
          <button className={btn(networkFilter === "5g")} onClick={() => setNetworkFilter("5g")}>
            5G
          </button>
        </div>

        <div className="ml-auto">
          <label htmlFor="sort" className="mr-2 text-xs font-medium text-gray-500">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="price">Price (lowest first)</option>
            <option value="data">Data (largest first)</option>
            <option value="validity">Validity (longest first)</option>
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <caption className="sr-only">
            Compare eSIM data plans for this destination
          </caption>
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-900">
                Plan
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-900">
                Provider
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-900">
                Data
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-900">
                Validity
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-900">
                Network
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-900">
                Price
              </th>
              {showPurchase && (
                <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-900">
                  Get it
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {visible.map((p, i) => (
              <tr key={`${p.provider}-${p.plan_name}-${i}`} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {p.plan_name}
                  {p.hotspot && (
                    <span className="ml-2 rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                      Hotspot
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">{p.provider}</td>
                <td className="px-4 py-3 text-gray-700">
                  {formatDataGb(p.data_gb, p.unlimited)}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {formatValidity(p.validity_days)}
                </td>
                <td className="px-4 py-3 text-gray-700">{p.network}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {formatMoney(p.price, p.currency)}
                </td>
                {showPurchase && (
                  <td className="px-4 py-3 text-right">
                    {p.purchase ? (
                      <a
                        href={p.purchase.href}
                        target="_blank"
                        rel={p.purchase.rel}
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                          p.purchase.sponsored
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "border border-gray-300 text-gray-700 hover:border-gray-500"
                        }`}
                      >
                        {p.purchase.label}
                        {p.purchase.sponsored && (
                          <span className="rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                            Affiliate
                          </span>
                        )}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-300" aria-hidden>
                        —
                      </span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Showing {visible.length} of {plans.length} plans.
      </p>
    </div>
  );
}