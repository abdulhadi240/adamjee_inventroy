import { getDashboardStats } from "@/lib/actions/dashboard";
import DashboardClientWrapper from "@/components/features/dashboard/DashboardClientWrapper";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const period = (resolvedParams?.period as string) || "monthly";

  const dashboardData = await getDashboardStats(period);

  if (!dashboardData) {
    return (
      <p className="py-16 text-center text-sm text-muted">
        Could not load dashboard data.
      </p>
    );
  }

  const safeData = {
    ...dashboardData,
    bestSelling: dashboardData.bestSelling ?? [],
    lowStock: dashboardData.lowStock ?? [],
    charts: dashboardData.charts ?? [],
  };

  return <DashboardClientWrapper data={safeData} />;
}