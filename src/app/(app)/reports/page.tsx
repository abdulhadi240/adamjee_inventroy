import type { Metadata } from "next";
import { getReportData } from "@/lib/actions/reports";
import { PageHeader } from "@/components/ui/motion";
import ProfitChart from "@/components/features/reports/ProfitChart";
import DateRangeFilter from "@/components/features/reports/DateRangeFilter";
import StatsOverview from "@/components/features/reports/StatsOverview";
import CategoryPerformanceTable from "@/components/features/reports/CategoryPerformanceTable";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const end = params.end || new Date().toISOString().split("T")[0];
  const start =
    params.start ||
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0];

  const data = await getReportData(start, end);

  return (
    <div>
      <PageHeader
        title="Financial reports"
        description="Revenue, cost and profit across your sales."
        actions={<DateRangeFilter key={`${start}-${end}`} />}
      />

      {!data ? (
        <div className="card p-10 text-center text-sm text-muted">
          Couldn&apos;t load report data. Please try again.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <StatsOverview summary={data.summary} />
          <ProfitChart data={data.chartData} />
          <CategoryPerformanceTable data={data.categoryPerformance} />
        </div>
      )}
    </div>
  );
}
