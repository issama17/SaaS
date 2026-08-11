import { PlusIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de votre espace de travail."
        actions={
          <Button>
            <PlusIcon />
            Nouveau projet
          </Button>
        }
      />

      <EmptyState
        title="Rien à afficher pour le moment"
        description="Vos métriques et vos activités récentes apparaîtront ici dès que vous aurez créé votre premier projet."
      />
    </>
  );
}
