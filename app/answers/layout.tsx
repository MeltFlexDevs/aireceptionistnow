import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import "./answers.css";

export default function AnswersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1 pt-14">{children}</main>
      <SiteFooter />
    </div>
  );
}
