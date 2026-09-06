import { readFileSync } from "fs";
import path from "path";

interface SiteConfig {
  site_name: string;
  base_url: string;
  contact_email: string;
  editor_name: string;
  editor_role: string;
  since_year: number;
}

const config = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "config", "site.json"),
    "utf-8",
  ),
) as SiteConfig;

export const SITE_NAME = config.site_name;

/** Canonical origin. Single source of truth is config/site.json. */
export const SITE_BASE_URL = config.base_url;

export const CONTACT_EMAIL = config.contact_email;

export const EDITOR = {
  name: config.editor_name,
  role: config.editor_role,
};

export const SINCE_YEAR = config.since_year;

export function pageUrl(path = ""): string {
  return `${SITE_BASE_URL}${path}`;
}