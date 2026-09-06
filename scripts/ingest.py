#!/usr/bin/env python3
"""eSIM Comparison Engine — ingestion pipeline (fetch → normalize → validate → score → write).

Data flow (in-memory dicts, then committed JSON files):

    data/raw/{CODE}.json                    latest snapshot per target country (MeiSIM API)
    data/processed/plans.json               canonical, deduplicated plan records
    data/processed/providers.json           provider rollups
    data/processed/destinations.json        per-destination coverage rollups
    data/processed/aggregates.json          per-destination rankings + answer-box stats
    data/processed/search-index.json        trimmed per-destination plan index for the
                                            client-side homepage finder

Zero third-party dependencies (stdlib only). Deterministic scoring weights come
from config/scoring.json. See README for usage.
"""

from __future__ import annotations

import argparse
import datetime as _dt
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
CONFIG_DIR = REPO_ROOT / "config"
DATA_RAW_DIR = REPO_ROOT / "data" / "raw"
DATA_PROCESSED_DIR = REPO_ROOT / "data" / "processed"

API_BASE = "https://api.meisimusa.com/mm/products"
SOURCE_NAME = "meisim_usa_api"
USER_AGENT = "roamrank-ingest/0.1 (comparison site, public catalog API)"
REQUEST_TIMEOUT_SECONDS = 30
RANKED_PLANS_LIMIT = 10

# ---------------------------------------------------------------------------
# Country canonicalization
# ---------------------------------------------------------------------------

# Full country names -> ISO 3166-1 alpha-2. Covers the names that appear in
# eSIM coverage payloads in place of codes (e.g. Ubigi ships "Japan"). Also
# maps regional/territory names and the common non-ISO alias "UK".
NAME_TO_ISO = {
    "AFGHANISTAN": "AF", "ALBANIA": "AL", "ALGERIA": "DZ", "ANDORRA": "AD",
    "ANGOLA": "AO", "ANTIGUA AND BARBUDA": "AG", "ARGENTINA": "AR",
    "ARMENIA": "AM", "AUSTRALIA": "AU", "AUSTRIA": "AT", "AZERBAIJAN": "AZ",
    "AZORES": "PT", "BAHAMAS": "BS", "BAHRAIN": "BH", "BANGLADESH": "BD",
    "BARBADOS": "BB", "BELARUS": "BY", "BELGIUM": "BE", "BELIZE": "BZ",
    "BENIN": "BJ", "BHUTAN": "BT", "BOLIVIA": "BO",
    "BOSNIA AND HERZEGOVINA": "BA", "BOTSWANA": "BW", "BRAZIL": "BR",
    "BRITAIN": "GB", "BRUNEI": "BN", "BULGARIA": "BG",
    "BURKINA FASO": "BF", "BURUNDI": "BI", "CAMBODIA": "KH",
    "CAMEROON": "CM", "CANADA": "CA", "CANARY ISLANDS": "ES",
    "CAPE VERDE": "CV", "CENTRAL AFRICAN REPUBLIC": "CF", "CHAD": "TD",
    "CHILE": "CL", "CHINA": "CN", "COLOMBIA": "CO", "COMOROS": "KM",
    "CONGO": "CG", "CONGO BRAZZAVILLE": "CG", "CONGO KINSHASA": "CD",
    "COSTA RICA": "CR", "COTE D'IVOIRE": "CI", "CROATIA": "HR", "CUBA": "CU",
    "CYPRUS": "CY", "CZECH REPUBLIC": "CZ", "CZECHIA": "CZ", "DENMARK": "DK",
    "DJIBOUTI": "DJ", "DOMINICA": "DM", "DOMINICAN REPUBLIC": "DO",
    "ECUADOR": "EC", "EGYPT": "EG", "EL SALVADOR": "SV",
    "EQUATORIAL GUINEA": "GQ", "ERITREA": "ER", "ESTONIA": "EE",
    "ESWATINI": "SZ", "ETHIOPIA": "ET", "FIJI": "FJ", "FINLAND": "FI",
    "FRANCE": "FR", "FRENCH GUIANA": "GF", "GABON": "GA", "GAMBIA": "GM",
    "GEORGIA": "GE", "GERMANY": "DE", "GHANA": "GH",
    "GIBRALTAR": "GI", "GREAT BRITAIN": "GB", "GREECE": "GR",
    "GRENADA": "GD", "GUADELOUPE": "GP", "GUATEMALA": "GT",
    "GUERNSEY": "GG", "GUINEA": "GN", "GUINEA BISSAU": "GW", "GUYANA": "GY",
    "HAITI": "HT", "HONDURAS": "HN", "HONG KONG": "HK", "HUNGARY": "HU",
    "ICELAND": "IS", "INDIA": "IN", "INDONESIA": "ID", "IRAN": "IR",
    "IRAQ": "IQ", "IRELAND": "IE", "ISLE OF MAN": "IM", "ISRAEL": "IL",
    "ITALY": "IT", "JAMAICA": "JM", "JAPAN": "JP", "JERSEY": "JE",
    "JORDAN": "JO", "KAZAKHSTAN": "KZ", "KENYA": "KE", "KIRIBATI": "KI",
    "KOSOVO": "XK", "KUWAIT": "KW", "KYRGYZSTAN": "KG", "LAOS": "LA",
    "LATVIA": "LV", "LEBANON": "LB", "LESOTHO": "LS", "LIBERIA": "LR",
    "LIBYA": "LY", "LIECHTENSTEIN": "LI", "LITHUANIA": "LT",
    "LUXEMBOURG": "LU", "MACAO": "MO", "MADAGASCAR": "MG",
    "MADEIRA": "PT", "MALAWI": "MW", "MALAYSIA": "MY", "MALDIVES": "MV",
    "MALI": "ML", "MALTA": "MT", "MARSHALL ISLANDS": "MH",
    "MARTINIQUE": "MQ", "MAURITANIA": "MR", "MAURITIUS": "MU", "MAYOTTE": "YT",
    "MEXICO": "MX", "MICRONESIA": "FM", "MOLDOVA": "MD", "MONACO": "MC",
    "MONGOLIA": "MN", "MONTENEGRO": "ME", "MOROCCO": "MA",
    "MOZAMBIQUE": "MZ", "MYANMAR": "MM", "NAMIBIA": "NA", "NEPAL": "NP",
    "NETHERLANDS": "NL", "NEW ZEALAND": "NZ", "NICARAGUA": "NI", "NIGER": "NE",
    "NIGERIA": "NG", "NORTH KOREA": "KP", "NORTH MACEDONIA": "MK",
    "NORWAY": "NO", "OMAN": "OM", "PAKISTAN": "PK", "PANAMA": "PA",
    "PAPUA NEW GUINEA": "PG", "PARAGUAY": "PY", "PERU": "PE",
    "PHILIPPINES": "PH", "POLAND": "PL", "PORTUGAL": "PT", "QATAR": "QA",
    "REUNION": "RE", "ROMANIA": "RO", "RUSSIA": "RU", "RWANDA": "RW",
    "SAINT BARTHELEMY": "BL", "SAINT LUCIA": "LC", "SAINT MARTIN": "MF",
    "SAMOA": "WS", "SAN MARINO": "SM", "SAUDI ARABIA": "SA", "SENEGAL": "SN",
    "SERBIA": "RS", "SEYCHELLES": "SC", "SIERRA LEONE": "SL",
    "SINGAPORE": "SG", "SLOVAKIA": "SK", "SLOVENIA": "SI",
    "SOLOMON ISLANDS": "SB", "SOMALIA": "SO", "SOUTH AFRICA": "ZA",
    "SOUTH KOREA": "KR", "SOUTH SUDAN": "SS", "SPAIN": "ES",
    "SRI LANKA": "LK", "SUDAN": "SD", "SURINAME": "SR", "SWAZILAND": "SZ",
    "SWEDEN": "SE", "SWITZERLAND": "CH", "SYRIA": "SY", "TAIWAN": "TW",
    "TAJIKISTAN": "TJ", "TANZANIA": "TZ", "THAILAND": "TH", "TIMOR LESTE": "TL",
    "TOGO": "TG", "TONGA": "TO", "TRINIDAD AND TOBAGO": "TT",
    "TUNISIA": "TN", "TURKEY": "TR", "TURKMENISTAN": "TM",
    "TURKS AND CAICOS": "TC", "UGANDA": "UG", "UKRAINE": "UA",
    "UNITED ARAB EMIRATES": "AE", "UNITED KINGDOM": "GB",
    "UNITED STATES": "US", "AMERICA": "US", "VATICAN CITY": "VA",
    "USA": "US", "URUGUAY": "UY", "UZBEKISTAN": "UZ", "VANUATU": "VU",
    "VATICAN": "VA", "VENEZUELA": "VE", "VIETNAM": "VN", "YEMEN": "YE",
    "ZAMBIA": "ZM", "ZIMBABWE": "ZW",
}

_ALPHA2_RE = re.compile(r"^[A-Z]{2}$")
_ALIAS_ISO = {"UK": "GB"}


def normalize_country(raw) -> str:
    """Canonicalize a country identifier from a payload to ISO alpha-2.

    Unknown/unrecognized values are passed through unchanged rather than
    guessed at.
    """
    value = str(raw).strip()
    if not value:
        return value
    upper = value.upper()
    if upper in _ALIAS_ISO:
        return _ALIAS_ISO[upper]
    if _ALPHA2_RE.match(value):
        return value
    if upper in NAME_TO_ISO:
        return NAME_TO_ISO[upper]
    if value.startswith("US-"):
        return "US"
    return value


def normalize_countries(values: list) -> list[str]:
    return sorted({normalize_country(v) for v in values if v and v.strip()})


# ---------------------------------------------------------------------------
# Small helpers
# ---------------------------------------------------------------------------


def load_json(path: Path):
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def utc_now_iso() -> str:
    return _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_passthrough(value) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def parse_bool_flag(value) -> bool:
    return str(value or "").strip() == "1"


def parse_float(value) -> float | None:
    if value is None:
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        num = float(value)
        return num if num == num else None  # reject NaN
    text = str(value).strip()
    if not text:
        return None
    try:
        num = float(text)
    except (TypeError, ValueError):
        return None
    return num if num == num else None  # reject NaN


def parse_int(value) -> int | None:
    num = parse_float(value)
    if num is None:
        return None
    return int(num)


_DATA_LIMIT_RE = re.compile(r"^\s*([0-9]+(?:\.[0-9]+)?)\s*(MB|GB|KB|TB)?\s*$", re.IGNORECASE)


def parse_data_limit(limit_value, unit_value) -> tuple[float | None, bool]:
    """Return (data_gb, unlimited). Accepts '50', '1000 MB', '1.95 GB', 'Unlimited'."""
    if limit_value is None:
        return None, False
    text = str(limit_value).strip()
    if not text or text.lower() in ("unlimited", "infinite", "unl"):
        return None, True

    match = _DATA_LIMIT_RE.match(text)
    if not match:
        # Unknown format: prefer PLAN_DATA_UNIT if present.
        number = parse_float(text)
        if number is None:
            return None, False
        unit = (str(unit_value) if unit_value is not None else "GB").upper()
    else:
        number = float(match.group(1))
        unit = (
            (match.group(2) or (unit_value if unit_value is not None else "GB"))
        ).upper()

    if unit == "TB":
        return number * 1024.0, False
    if unit == "MB":
        return number / 1024.0, False
    if unit == "KB":
        return number / (1024.0 * 1024.0), False
    return number, False  # GB (default)


def parse_validity_days(days_value, hours_value) -> int | None:
    days = parse_int(days_value)
    if days is not None and days > 0:
        return days
    hours = parse_int(hours_value)
    if hours is not None and hours > 0:
        return int(round(hours / 24.0))
    return None


def median(values: list[float]) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    n = len(ordered)
    mid = n // 2
    if n % 2 == 1:
        return ordered[mid]
    return (ordered[mid - 1] + ordered[mid]) / 2.0


# ---------------------------------------------------------------------------
# Fetch stage
# ---------------------------------------------------------------------------


def api_fetch_country(country_code: str) -> dict:
    url = f"{API_BASE}?country={country_code}"
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as resp:
        return json.loads(resp.read().decode("utf-8"))


def stage_fetch(state: dict) -> dict:
    codes = state["target_codes"]
    run_at = utc_now_iso()
    state["last_updated"] = run_at
    state["raw_files"] = {}
    state["flagged"] = []

    for code in codes:
        print(f"[fetch] {code} …", flush=True)
        payload = api_fetch_country(code)
        if not payload.get("ok"):
            raise RuntimeError(f"MeiSIM API returned ok=false for {code}")
        raw_path = DATA_RAW_DIR / f"{code}.json"
        with open(raw_path, "w", encoding="utf-8") as fh:
            json.dump(payload, fh, indent=2, ensure_ascii=False)
        count = payload.get("count")
        returned = len(payload.get("products", []))
        state["raw_files"][code] = raw_path
        print(
            f"[fetch] {code}: count={count} returned={returned} -> {raw_path.name}",
            flush=True,
        )
        time.sleep(0.5)

    return state


# ---------------------------------------------------------------------------
# Normalize stage
# ---------------------------------------------------------------------------


def details_to_dict(product_details: list) -> dict:
    out: dict[str, str] = {}
    for item in product_details or []:
        name = (item.get("name") or "").strip()
        value = item.get("value")
        if not name or value is None:
            continue
        # Merge the trailing-space variant ("PLAN_DETAILS ") into the plain key.
        name = name.replace(" ", "") if name.startswith("PLAN_DETAILS") else name
        out[name] = value
    return out


def normalize_product(product: dict) -> dict | None:
    details = details_to_dict(product.get("productDetails") or [])
    data_gb, unlimited = parse_data_limit(
        details.get("PLAN_DATA_LIMIT") or details.get("PLAN_DATA_QUOTA"),
        details.get("PLAN_DATA_UNIT"),
    )

    validity_days = parse_validity_days(
        details.get("VALIDITY_IN_DAYS"), details.get("PLAN_VALIDITY")
    )
    price = parse_float(product.get("retailPrice"))
    if price is None or price <= 0:
        return None

    networks_short = (details.get("NETWORKS_SHORT") or "").upper()
    if parse_bool_flag(details.get("FIVEG")) or "5G" in networks_short:
        network = "5G"
    elif "4G" in networks_short or "LTE" in networks_short:
        network = "4G"
    else:
        network = "Unknown"

    price_per_gb = None
    if not unlimited and data_gb and data_gb > 0:
        price_per_gb = round(price / data_gb, 2)

    return {
        "id": product.get("uniqueId") or product.get("productId"),
        "plan_name": details.get("PLAN_TITLE") or "Untitled plan",
        "provider": product.get("providerName") or "Unknown",
        "provider_logo": product.get("providerLogo"),
        "countries": normalize_countries(product.get("countries") or []),
        "regions": [r for r in (product.get("regions") or []) if r],
        "data_gb": data_gb,
        "unlimited": unlimited,
        "price": price,
        "currency": product.get("currencyCode") or "USD",
        "price_per_gb": price_per_gb,
        "validity_days": validity_days,
        "network": network,
        "hotspot": parse_bool_flag(details.get("HOTSPOT")),
        "calls": parse_bool_flag(details.get("HAS_CALLS")),
        "sms": parse_bool_flag(details.get("HAS_SMS")),
        "topup": parse_bool_flag(details.get("TOPUP")),
        "speed": parse_passthrough(details.get("SPEED")),
        "activation_policy": parse_passthrough(details.get("ACTIVATION_POLICY")),
        "usage_tracking": parse_passthrough(details.get("USAGE_TRACKING")),
        "coverage": parse_passthrough(details.get("PLAN_COVERAGE")),
        "externally_shown": parse_bool_flag(details.get("EXTERNALLY_SHOWN")),
        "only_returns_inventory": parse_bool_flag(
            details.get("ONLY_RETURNS_INVENTORY")
        ),
        "source": SOURCE_NAME,
        "source_updated": parse_passthrough(product.get("updated")),
        "last_updated": None,  # set in validate stage once run timestamp is known
    }


def stage_normalize(state: dict) -> dict:
    plans: list[dict] = []
    seen: set[str] = set()
    duplicates = 0

    for code, raw_path in state["raw_files"].items():
        payload = load_json(raw_path)
        for product in payload.get("products", []):
            record = normalize_product(product)
            if record is None:
                continue
            key = record["id"]
            if key is None:
                # Uniqueness fallback without an id.
                key = (
                    f"{record['provider']}|{record['plan_name']}|"
                    f"{record['price']}|{record['validity_days']}"
                )
            if key in seen:
                duplicates += 1
                continue
            seen.add(key)
            plans.append(record)

    print(f"[normalize] {len(plans)} unique plans (dropped {duplicates} exact duplicates)")
    state["plans"] = plans
    return state


# ---------------------------------------------------------------------------
# Validate stage
# ---------------------------------------------------------------------------


def stage_validate(state: dict) -> dict:
    plans = state["plans"]
    valid: list[dict] = []
    flagged: list[dict] = []
    run_at = state["last_updated"]

    for plan in plans:
        reasons = []
        if plan["id"] is None:
            reasons.append("missing id")
        if plan["price"] <= 0:
            reasons.append("price <= 0")
        if plan["data_gb"] is None and not plan["unlimited"]:
            reasons.append("no data limit or unlimited flag")
        if plan["validity_days"] is None or plan["validity_days"] <= 0:
            reasons.append("invalid validity")
        if not plan["countries"]:
            reasons.append("no country coverage")
        if not plan["unlimited"] and plan["data_gb"] and plan["data_gb"] <= 0:
            reasons.append("data limit <= 0")

        if reasons:
            flagged.append({"id": plan["id"], "provider": plan["provider"], "reasons": reasons})
            continue

        plan["last_updated"] = run_at
        valid.append(plan)

    print(f"[validate] {len(valid)} valid plans, {len(flagged)} flagged/dropped")
    state["plans"] = valid
    state["flagged_records"] = flagged
    return state


# ---------------------------------------------------------------------------
# Score stage — deterministic value score (per destination)
# ---------------------------------------------------------------------------


def _load_scoring() -> dict:
    return load_json(CONFIG_DIR / "scoring.json")


def network_score(network: str) -> float:
    if network == "5G":
        return 1.0
    if network == "4G":
        return 0.5
    return 0.0


def destination_scoring(
    plans: list[dict], dest_code: str, scoring: dict, reliability_map: dict
) -> list[tuple[dict, int]]:
    weights = {
        "price": scoring["weights"]["price"],
        "data": scoring["weights"]["data"],
        "validity": scoring["weights"]["validity"],
        "network": scoring["weights"]["network"],
        "hotspot": scoring["weights"]["hotspot"],
        "reliability": scoring["weights"]["reliability"],
    }
    norm = scoring["normalization"]
    price_cap = norm["price_per_gb_cap"]
    nominal_gb = norm["unlimited_nominal_data_gb"]
    validity_cap = norm["validity_cap_days"]

    pool = [p for p in plans if dest_code in p["countries"]]
    if not pool:
        return []

    max_data = max(
        (p["data_gb"] for p in pool if not p["unlimited"] and p["data_gb"]),
        default=None,
    )

    scored: list[tuple[dict, int]] = []
    for plan in pool:
        pgb = plan["price_per_gb"]
        if pgb is None and plan["unlimited"]:
            pgb = plan["price"] / nominal_gb
        price_score = 0.0
        if pgb is not None and pgb > 0:
            price_score = max(0.0, 1.0 - min(pgb, price_cap) / price_cap)

        data_score = 0.0
        if plan["unlimited"]:
            data_score = 1.0
        elif max_data and plan["data_gb"]:
            data_score = min(plan["data_gb"] / max_data, 1.0)

        validity_score = min(plan["validity_days"] or 0, validity_cap) / validity_cap
        net_score = network_score(plan["network"])
        hotspot_score = 1.0 if plan["hotspot"] else 0.0
        reliability_score = reliability_map.get(plan["provider"], scoring["reliability"]["baseline"])

        value = 100.0 * (
            weights["price"] * price_score
            + weights["data"] * data_score
            + weights["validity"] * validity_score
            + weights["network"] * net_score
            + weights["hotspot"] * hotspot_score
            + weights["reliability"] * reliability_score
        )
        scored.append((plan, int(round(value))))

    # Descending value score; ties broken by ascending price.
    scored.sort(key=lambda item: (-item[1], item[0]["price"]))
    return scored


def stage_score(state: dict) -> dict:
    scoring = _load_scoring()
    reliability_map = dict(scoring["reliability"].get("overrides") or {})
    threshold = scoring.get("value_score_threshold", 0)
    plans = state["plans"]
    target_codes = state["target_codes"]

    aggregates: dict[str, dict] = {}
    all_scored_by_dest: dict[str, list] = {}

    for code in target_codes:
        scored = destination_scoring(plans, code, scoring, reliability_map)
        scored = [(plan, score) for plan, score in scored if score >= threshold]
        all_scored_by_dest[code] = scored
        if not scored:
            aggregates[code] = None
            print(f"[score] {code}: no plans")
            continue
        valid_pgb = [p["price_per_gb"] for p, _ in scored if p["price_per_gb"] is not None]
        prices = [p["price"] for p, _ in scored]
        cheapest = min(scored, key=lambda item: item[0]["price"])
        best = scored[0]

        def summarize(plan: dict) -> dict:
            return {
                "plan_name": plan["plan_name"],
                "provider": plan["provider"],
                "price": plan["price"],
                "currency": plan["currency"],
                "data_gb": plan["data_gb"],
                "price_per_gb": plan["price_per_gb"],
                "unlimited": plan["unlimited"],
                "validity_days": plan["validity_days"],
                "network": plan["network"],
            }

        agg = {
            "country_code": code,
            "plan_count": len(scored),
            "provider_count": len({p["provider"] for p, _ in scored}),
            "provider_names": sorted({p["provider"] for p, _ in scored}),
            "cheapest_plan": summarize(cheapest[0]),
            "best_value_plan": summarize(best[0]),
            "best_value_score": best[1],
            "median_price_per_gb": median(valid_pgb),
            "avg_price_per_gb": round(sum(valid_pgb) / len(valid_pgb), 2) if valid_pgb else None,
            "price_range": {"min": min(prices), "max": max(prices)},
            "ranked_plans": [
                {**summarize(plan), "value_score": score}
                for plan, score in scored[:RANKED_PLANS_LIMIT]
            ],
            "last_updated": state["last_updated"],
        }
        aggregates[code] = agg
        print(
            f"[score] {code}: {agg['plan_count']} plans, cheapest "
            f"${cheapest[0]['price']:.2f}, best value score {best[1]}",
            flush=True,
        )

    state["aggregates"] = aggregates
    state["scored_by_dest"] = all_scored_by_dest
    state["meta"] = {
        "source": SOURCE_NAME,
        "last_updated": state["last_updated"],
        "plan_count": len(plans),
    }
    return state


# ---------------------------------------------------------------------------
# Write stage
# ---------------------------------------------------------------------------

DEST_ORDER = ["JP", "US", "IN", "TH", "MX", "GB", "IT", "VN", "ES", "FR"]


def _dest_names() -> dict[str, dict]:
    """Destination metadata (name/slug/url_name) keyed by ISO code."""
    config = load_json(CONFIG_DIR / "destinations.json")
    return {d["code"]: d for d in config["destinations"]}


def stage_write(state: dict) -> dict:
    plans = state["plans"]
    aggregates = state["aggregates"]
    scored_by_dest = state["scored_by_dest"]

    # providers.json — rollup across all valid plans.
    by_provider: dict[str, dict] = {}
    for plan in plans:
        name = plan["provider"]
        entry = by_provider.setdefault(
            name,
            {
                "name": name,
                "logo": plan["provider_logo"],
                "plan_count": 0,
                "country_codes": set(),
                "price_min": None,
                "price_max": None,
            },
        )
        entry["plan_count"] += 1
        entry["country_codes"].update(plan["countries"])
        price = plan["price"]
        entry["price_min"] = price if entry["price_min"] is None else min(entry["price_min"], price)
        entry["price_max"] = max(entry["price_max"] or 0, price)

    providers_out = []
    for name in sorted(by_provider):
        entry = by_provider[name]
        entry["country_codes"] = sorted(entry["country_codes"])
        entry["price_min"] = round(entry["price_min"], 2)
        entry["price_max"] = round(entry["price_max"], 2)
        providers_out.append(entry)

    # destinations.json — coverage rollup from aggregates.
    dests_out = []
    for code in DEST_ORDER:
        agg = aggregates.get(code)
        if not agg:
            dests_out.append({"country_code": code, "plan_count": 0})
            continue
        dests_out.append(
            {
                "country_code": code,
                "plan_count": agg["plan_count"],
                "provider_count": agg["provider_count"],
                "cheapest_price": agg["cheapest_plan"]["price"],
                "best_value_plan_name": agg["best_value_plan"]["plan_name"],
                "last_updated": agg["last_updated"],
            }
        )

    # aggregates.json — answer-box stats per destination.
    aggregates_out = {}
    for code in DEST_ORDER:
        aggregates_out[code] = aggregates.get(code)

    # search-index.json — trimmed per-destination index for the client-side finder.
    dest_names = _dest_names()
    dest_index = []
    for code in DEST_ORDER:
        agg = aggregates.get(code)
        if agg is None:
            continue
        plans_out = []
        for plan, score in scored_by_dest.get(code, []):
            plans_out.append(
                {
                    "plan_name": plan["plan_name"],
                    "provider": plan["provider"],
                    "price": plan["price"],
                    "currency": plan["currency"],
                    "data_gb": plan["data_gb"],
                    "unlimited": plan["unlimited"],
                    "price_per_gb": plan["price_per_gb"],
                    "validity_days": plan["validity_days"],
                    "network": plan["network"],
                    "hotspot": plan["hotspot"],
                    "value_score": score,
                }
            )
        info = dest_names.get(code, {})
        dest_index.append(
            {
                "code": code,
                "name": info.get("name", code),
                "slug": info.get("slug", code.lower()),
                "url_name": info.get("url_name"),
                "plan_count": agg["plan_count"],
                "provider_count": agg["provider_count"],
                "cheapest_price": agg["cheapest_plan"]["price"],
                "plans": plans_out,
            }
        )

    files = {
        "plans": {"meta": state["meta"], "plans": plans},
        "providers": {"meta": state["meta"], "providers": providers_out},
        "destinations": {"meta": state["meta"], "destinations": dests_out},
        "aggregates": {"meta": state["meta"], "aggregates": aggregates_out},
        "search-index": {"meta": state["meta"], "destinations": dest_index},
    }

    for name, payload in files.items():
        out_path = DATA_PROCESSED_DIR / f"{name}.json"
        with open(out_path, "w", encoding="utf-8") as fh:
            json.dump(payload, fh, indent=2, ensure_ascii=False)
        print(f"[write] {out_path.name}")

    # Invalid/flagged record audit trail (reviewable, never auto-deleted).
    flagged_path = DATA_PROCESSED_DIR / "ingest_report.json"
    report = {
        "meta": state["meta"] | {"flagged_count": len(state.get("flagged_records", []))},
        "flagged_records": state.get("flagged_records", []),
    }
    with open(flagged_path, "w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2, ensure_ascii=False)
    print(f"[write] {flagged_path.name}")

    return state


# ---------------------------------------------------------------------------
# Pipeline wiring
# ---------------------------------------------------------------------------

PIPELINE = {
    "fetch": stage_fetch,
    "normalize": stage_normalize,
    "validate": stage_validate,
    "score": stage_score,
    "write": stage_write,
}
STAGE_ORDER = ["fetch", "normalize", "validate", "score", "write"]


def load_target_codes() -> list[str]:
    config = load_json(CONFIG_DIR / "destinations.json")
    return [d["code"] for d in config["destinations"]]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="ingest.py",
        description="eSIM Comparison Engine ingestion pipeline (fetch -> normalize -> validate -> score -> write).",
    )
    parser.add_argument(
        "--stage",
        choices=list(PIPELINE),
        help="Run only a single pipeline stage (start chains may need --offline).",
    )
    parser.add_argument(
        "--destinations",
        default=None,
        help="Comma-separated country codes to fetch (default: all in config/destinations.json).",
    )
    parser.add_argument(
        "--offline",
        action="store_true",
        help="Skip the fetch stage and reuse existing data/raw snapshots.",
    )
    args = parser.parse_args(argv)

    codes = (
        [c.strip().upper() for c in args.destinations.split(",") if c.strip()]
        if args.destinations
        else load_target_codes()
    )

    state: dict = {"target_codes": codes}

    if args.offline:
        print("[offline] reusing existing data/raw/*.json snapshots")
        state["raw_files"] = {code: DATA_RAW_DIR / f"{code}.json" for code in codes}
        state["last_updated"] = utc_now_iso()

    if args.stage:
        selected = [args.stage]
    elif args.offline:
        selected = [s for s in STAGE_ORDER if s != "fetch"]
    else:
        selected = STAGE_ORDER

    for stage in selected:
        PIPELINE[stage](state)

    return 0


if __name__ == "__main__":
    sys.exit(main())