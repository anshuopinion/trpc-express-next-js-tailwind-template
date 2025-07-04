import Navigation from "@/layout/main-layout/navigation";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <Navigation />
      {children}
    </main>
  );
}