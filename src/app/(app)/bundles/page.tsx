import { getBundles, getBundleFormOptions } from "@/lib/actions/bundles";
import BundleList from "@/components/features/bundles/BundleList";

export const metadata = { title: "Bundles" };

export default async function BundlesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const [bundles, options] = await Promise.all([
    getBundles(search),
    getBundleFormOptions(),
  ]);

  return <BundleList bundles={bundles} options={options} search={search} />;
}
