import type { Author } from "@/lib/site";

/**
 * Author byline for a comparison page — avatar, name, role, LinkedIn link and
 * the published/updated dates. Adds E-E-A-T signals that match the schema.org
 * author + dates emitted by each page. Server component (no interactivity).
 */
export function CompareByline({
  author,
  published,
  updated,
}: {
  author: Author;
  /** Human-readable published date, e.g. "July 2026". */
  published: string;
  /** Human-readable updated date, e.g. "July 2026". */
  updated: string;
}) {
  return (
    <div className="compare-byline">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="compare-byline-avatar"
        src={author.image}
        alt={author.name}
        width={40}
        height={40}
        loading="lazy"
      />
      <div className="compare-byline-text">
        <span className="compare-byline-name">
          By{" "}
          <a href={author.linkedin} target="_blank" rel="noopener noreferrer">
            {author.name}
          </a>
          <span className="compare-byline-role"> · {author.role}</span>
        </span>
        <span className="compare-byline-dates">
          Published {published} · Updated {updated}
        </span>
      </div>
    </div>
  );
}
