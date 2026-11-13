import AuthShowcase from "@/components/features/auth/AuthShowcase";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      {/* Two-column card: brand panel + form */}
      <div className="grid w-full max-w-[960px] overflow-hidden rounded-3xl border border-line bg-white shadow-lift md:min-h-[580px] md:grid-cols-2">
        <AuthShowcase />
        <main className="flex items-center justify-center px-6 py-10 sm:px-12">
          {children}
        </main>
      </div>
    </div>
  );
}
