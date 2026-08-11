import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Facturation" };

export default function BillingPage() {
  return (
    <>
      <PageHeader title="Facturation" description="Abonnement, factures et moyens de paiement." />
      <EmptyState
        title="Bientôt disponible"
        description="Cette section fait partie du squelette de l'application et reste à implémenter."
      />
    </>
  );
}
