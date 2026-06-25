import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      {/* SiteHeader is position:fixed at 56px tall — offset the content below it. */}
      <main className="flex-1 pt-14">{children}</main>
      <SiteFooter />
    </div>
  );
}
