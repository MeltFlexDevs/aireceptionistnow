import { Download } from "../../icons";

export function Recording({ url }: { url: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <audio controls preload="none" src={url} className="h-10 w-full sm:flex-1">
        Your browser doesn&apos;t support audio playback.
      </audio>
      <a
        href={url}
        download
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
      >
        <Download className="h-4 w-4" />
        Download
      </a>
    </div>
  );
}
