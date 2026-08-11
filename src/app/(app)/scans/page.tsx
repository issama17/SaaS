import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Scans" };

export default function ScansPage() {
  return (
    <>
      <PageHeader title="Scans" description="Historique des exécutions et planification des scans récurrents." />
      <EmptyState
        title="Vue en cours de construction"
        description="Les données existent déjà dans le schéma et sur le dashboard ; cette vue détaillée reste à brancher."
      />
    </>
  );
}
