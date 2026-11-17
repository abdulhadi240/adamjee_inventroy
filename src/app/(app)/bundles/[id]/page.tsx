import { redirect } from "next/navigation";
import { getBundleById, getBundleFormOptions } from "@/lib/actions/bundles";
import BundleDetail from "@/components/features/bundles/BundleDetail";

export const metadata = { title: "Bundle" };

export default async function BundlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) redirect("/bundles");

  const [bundle, options] = await Promise.all([
    getBundleById(numericId),
    getBundleFormOptions(),
  ]);

  if (!bundle) redirect("/bundles");

  return <BundleDetail bundle={bundle} options={options} />;
}
