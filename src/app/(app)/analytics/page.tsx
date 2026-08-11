import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" description="Suivez l'usage et la performance de votre produit." />
      <EmptyState
        title="Bientôt disponible"
        description="Cette section fait partie du squelette de l'application et reste à implémenter."
      />
    </>
  );
}
