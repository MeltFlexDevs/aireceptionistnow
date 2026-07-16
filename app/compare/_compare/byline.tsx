import type { Author } from "@/lib/site";

export function CompareByline({
  author,
  published,
  updated,
}: {
  author: Author;
  published: string;
  updated: string;
}) {
  return (
    <div className="compare-byline">
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
