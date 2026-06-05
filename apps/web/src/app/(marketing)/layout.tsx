import { Nav } from "@/components/nav";
import { NavProvider } from "@/components/nav/context";
import { ContentShell } from "@/components/nav/shell";
import { NavToggle } from "@/components/nav/toggle";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavProvider>
      <div className="flex-1 flex flex-col">
        <header className="h-[60px] shrink-0 border-b flex items-center px-4">
          <NavToggle />
        </header>
        <ContentShell>
          <Nav />
          {children}
        </ContentShell>
      </div>
    </NavProvider>
  );
}
