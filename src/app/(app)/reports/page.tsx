import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Rapports" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Rapports" description="Exports PDF et CSV pour le comité de direction et les audits clients." />
      <EmptyState
        title="Vue en cours de construction"
        description="Les données existent déjà dans le schéma et sur le dashboard ; cette vue détaillée reste à brancher."
      />
    </>
  );
}
