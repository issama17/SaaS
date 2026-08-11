import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Projets" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projets" description="Gérez vos projets et leurs environnements." />
      <EmptyState
        title="Bientôt disponible"
        description="Cette section fait partie du squelette de l'application et reste à implémenter."
      />
    </>
  );
}
