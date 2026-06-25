import type { ReactNode } from "react";
import Image from "next/image";

// Editorial blog-body styling: Inter light, near-black on white, soft grays,
// generous line height. Mirrors the AI Receptionist Now marketing site.

export function Lead({ children }: { children: ReactNode }) {
  return <p className="mb-8 text-[18px] leading-[1.7] text-[#333]">{children}</p>;
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="mb-5 text-[16px] leading-[1.85] font-light text-[#444]">
      {children}
    </p>
  );
}

export function H2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-12 mb-4 scroll-mt-24 text-[26px] font-medium tracking-[-0.01em] text-[#1a1a1a] sm:text-[28px]"
    >
      {children}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-8 mb-3 text-[20px] font-medium tracking-[-0.01em] text-[#1a1a1a]">
      {children}
    </h3>
  );
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="mb-5 list-disc space-y-2 pl-6 text-[16px] leading-[1.7] font-light text-[#444] marker:text-[#bbb]">
      {children}
    </ul>
  );
}

export function OL({ children }: { children: ReactNode }) {
  return (
    <ol className="mb-5 list-decimal space-y-2 pl-6 text-[16px] leading-[1.7] font-light text-[#444] marker:text-[#999]">
      {children}
    </ol>
  );
}

export function LI({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}

export function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-medium text-[#1a1a1a]">{children}</strong>;
}

export function Ext({
  href,
  children,
  nofollow,
}: {
  href: string;
  children: ReactNode;
  /** Add rel="nofollow" — use for links we don't want to vouch for. */
  nofollow?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel={nofollow ? "noopener noreferrer nofollow" : "noopener noreferrer"}
      className="text-[#1a1a1a] underline decoration-black/25 underline-offset-2 transition-colors hover:decoration-[#1a1a1a]"
    >
      {children}
    </a>
  );
}

export function Internal({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-[#1a1a1a] underline decoration-black/25 underline-offset-2 transition-colors hover:decoration-[#1a1a1a]"
    >
      {children}
    </a>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="my-7 border-l-2 border-[#1a1a1a] bg-[#fafafa] px-6 py-[18px] text-[17px] leading-[1.6] font-light text-[#1a1a1a]">
      {children}
    </div>
  );
}

export function Mono({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-[#f0f0f0] px-1.5 py-0.5 font-mono text-[0.875em] text-[#1a1a1a]">
      {children}
    </code>
  );
}

export function Figure({
  src,
  alt,
  width,
  height,
  caption,
  credit,
  creditUrl,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  credit?: string;
  creditUrl?: string;
}) {
  return (
    <figure className="my-9">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full bg-[#f5f5f5]"
        sizes="(min-width: 768px) 760px, 100vw"
      />
      {(caption || credit) && (
        <figcaption className="mt-3 text-[13px] leading-6 text-[#999]">
          {caption}
          {credit && (
            <span>
              {caption ? " " : ""}
              {creditUrl ? (
                <a
                  href={creditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-[#ddd] underline-offset-2 hover:text-[#1a1a1a]"
                >
                  ({credit})
                </a>
              ) : (
                `(${credit})`
              )}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}

export function KeyTakeaways({ items }: { items: ReactNode[] }) {
  return (
    <aside className="mb-10 border-l-2 border-[#1a1a1a] bg-[#fafafa] px-6 py-5">
      <p className="mb-3 text-[10px] font-semibold tracking-[0.08em] text-[#999] uppercase">
        Key takeaways
      </p>
      <ul className="space-y-2 text-[15px] leading-[1.7] font-light text-[#444]">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span aria-hidden="true" className="mt-px text-[#1a1a1a]">
              →
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function Table({
  head,
  rows,
  caption,
}: {
  head: ReactNode[];
  rows: ReactNode[][];
  caption?: string;
}) {
  return (
    <div className="my-7 overflow-x-auto">
      {caption && (
        <p className="mb-2 text-[12px] font-medium tracking-[0.04em] text-[#888] uppercase">
          {caption}
        </p>
      )}
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={i}
                scope="col"
                className="border-b-2 border-[#e5e5e5] px-3.5 py-2.5 text-left text-[12px] font-medium tracking-[0.04em] text-[#888] uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="transition-colors hover:bg-[#fafafa]">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="border-b border-[#f0f0f0] px-3.5 py-3 font-light leading-[1.5] text-[#333]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type FaqItem = { q: string; a: string };

export function FAQList({ items }: { items: FaqItem[] }) {
  return (
    <section className="mt-12">
      <H2 id="faq">Frequently asked questions</H2>
      <div className="border-t border-[#e5e5e5]">
        {items.map((item) => (
          <details key={item.q} className="group border-b border-[#e5e5e5] py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-[#1a1a1a] [&::-webkit-details-marker]:hidden">
              {item.q}
              <span
                aria-hidden="true"
                className="text-[#999] transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-[15px] leading-[1.7] font-light text-[#444]">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export type Source = {
  title: string;
  url: string;
  /** Add rel="nofollow" — use for links we don't want to vouch for. */
  nofollow?: boolean;
};

export function Sources({ sources }: { sources: Source[] }) {
  return (
    <section className="mt-14 border-t border-[#e5e5e5] pt-8">
      <h2 className="mb-4 text-[11px] font-medium tracking-[0.06em] text-[#999] uppercase">
        Sources
      </h2>
      <ol className="list-decimal space-y-1.5 pl-6 text-[14px] leading-6 font-light text-[#666] marker:text-[#bbb]">
        {sources.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel={
                s.nofollow ? "noopener noreferrer nofollow" : "noopener noreferrer"
              }
              className="underline decoration-[#ddd] underline-offset-2 transition-colors hover:text-[#1a1a1a]"
            >
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
