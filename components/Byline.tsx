import Link from "next/link";
import { formatLongDate } from "@/lib/format";
import { EDITOR } from "@/lib/site";

/** E-E-A-T author byline: who wrote it + when the data was last verified. */
export default function Byline({ lastUpdated }: { lastUpdated: string }) {
  return (
    <p className="mt-3 text-sm text-gray-500">
      By <Link href="/about" className="text-gray-700 hover:underline">{EDITOR.name}</Link>
      {" ("}
      {EDITOR.role}
      {") · Last verified "}
      {formatLongDate(lastUpdated)}
    </p>
  );
}