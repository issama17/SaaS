import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <>
      <PageHeader title="Support" description="Documentation, statut du service et contact." />
      <EmptyState
        title="Bientôt disponible"
        description="Cette section fait partie du squelette de l'application et reste à implémenter."
      />
    </>
  );
}
