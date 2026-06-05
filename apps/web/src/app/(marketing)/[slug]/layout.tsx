import { Footer } from "@/components/footer";

export default function SlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 min-h-0">{children}</main>
      <Footer className="border-t" />
    </div>
  );
}
