# Blog figures

Photographs for blog posts, shot from a Behance reference. Ported from
techdrawai's `scripts/blog-figures`.

```
node scripts/blog-figures/harvest.mjs     # pin a Behance cover per reference term
node scripts/blog-figures/generate.mjs    # reference -> our photo -> public/blog/<out>.webp
node scripts/blog-figures/generate.mjs --force <out>   # redo one
```

## The reference rule

A Behance cover is pinned by URL in `refs.json` and used **only as a reference
for the kind of place to photograph** - its materials, palette and light. It is
never served. The model re-shoots the scene described in `plan.mjs` from its own
viewpoint, and only that frame ships.

## Notes

- **Behance may answer `harvest.mjs` with 403** (a JavaScript challenge). When it
  does, run the search in a normal browser session, pick the cover by eye and
  write the entry into `refs.json` by hand - same shape as the others.
- **Pick the reference by looking at it.** Behance ranks by engagement, so the
  top result for a query is often a brand identity or a floor plan.
- **The subject line leads the prompt.** After the style paragraph it loses to
  the reference image.
- **Count hands in the prompt** whenever a person is in frame; the first kitchen
  frame came back with three.
- **Rename the output when you regenerate a published image.** The image
  optimiser caches by URL, so a new file under an old name can keep serving the
  old picture.
