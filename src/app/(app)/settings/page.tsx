import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Paramètres" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Paramètres" description="Préférences de l'espace de travail et de l'équipe." />
      <EmptyState
        title="Bientôt disponible"
        description="Cette section fait partie du squelette de l'application et reste à implémenter."
      />
    </>
  );
}
