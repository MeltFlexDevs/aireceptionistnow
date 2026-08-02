// Chrome moved into the two pages below this layout (and into their localized
// twins under app/[locale]/blog). The header carries the language menu, and the
// menu is per-PAGE: on an article it must list the locales that ARTICLE exists
// in, which a layout has no way of knowing. Keeping the header here would have
// meant either no language menu on the English blog or a wrong one.
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
