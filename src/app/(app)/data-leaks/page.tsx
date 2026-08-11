import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Fuites de données" };

export default function DataLeaksPage() {
  return (
    <>
      <PageHeader title="Fuites de données" description="Identifiants exposés dans les dumps, combolists et stealer logs." />
      <EmptyState
        title="Vue en cours de construction"
        description="Les données existent déjà dans le schéma et sur le dashboard ; cette vue détaillée reste à brancher."
      />
    </>
  );
}
