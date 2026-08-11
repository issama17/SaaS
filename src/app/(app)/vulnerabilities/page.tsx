import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Vulnérabilités" };

export default function VulnerabilitiesPage() {
  return (
    <>
      <PageHeader title="Vulnérabilités" description="File de remédiation complète, filtrable par sévérité, KEV et SLA." />
      <EmptyState
        title="Vue en cours de construction"
        description="Les données existent déjà dans le schéma et sur le dashboard ; cette vue détaillée reste à brancher."
      />
    </>
  );
}
