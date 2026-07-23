"use client";

import { useState } from "react";

/**
 * Click-to-load YouTube facade: renders a lightweight dark placeholder and only
 * mounts the real (heavy) YouTube player iframe once the reader clicks play.
 * Keeps the player's JS/network cost off the initial page load entirely.
 */
export function YouTubeFacade({ id, title }: { id: string; title: string }) {
  const [active, setActive] = useState(false);

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#111]">
      {active ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center"
        >
          <span className="flex size-[68px] items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25 backdrop-blur transition-colors group-hover:bg-white/20">
            <span className="ml-1 border-y-[11px] border-l-[18px] border-y-transparent border-l-white" />
          </span>
          <span className="max-w-[80%] text-[14px] leading-snug font-light text-white/80">
            {title}
          </span>
          <span className="text-[10px] font-medium tracking-[0.12em] text-white/40 uppercase">
            Watch on YouTube
          </span>
        </button>
      )}
    </div>
  );
}
