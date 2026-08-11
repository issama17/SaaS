import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Clients" };

export default function CustomersPage() {
  return (
    <>
      <PageHeader title="Clients" description="Consultez et administrez vos comptes clients." />
      <EmptyState
        title="Bientôt disponible"
        description="Cette section fait partie du squelette de l'application et reste à implémenter."
      />
    </>
  );
}
