import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Surface d'attaque" };

export default function AttackSurfacePage() {
  return (
    <>
      <PageHeader title="Surface d'attaque" description="Inventaire des actifs découverts : sous-domaines, IP, services et certificats." />
      <EmptyState
        title="Vue en cours de construction"
        description="Les données existent déjà dans le schéma et sur le dashboard ; cette vue détaillée reste à brancher."
      />
    </>
  );
}
