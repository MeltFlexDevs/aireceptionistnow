import { Download } from "../../icons";
import { getDictionary } from "@/lib/i18n/server";

export async function Recording({ url }: { url: string }) {
  const d = (await getDictionary()).calls.detail;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <audio controls preload="none" src={url} className="h-10 w-full sm:flex-1">
        {d.audioUnsupported}
      </audio>
      <a
        href={url}
        download
        className="press inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
      >
        <Download className="h-4 w-4" />
        {d.download}
      </a>
    </div>
  );
}
