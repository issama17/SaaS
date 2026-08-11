import * as React from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireUser } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Point de contrôle unique de la zone authentifiée : toute page sous (app)
  // passe par ce layout, donc aucune n'est atteignable sans session valide.
  const user = await requireUser();

  return (
    <SidebarProvider>
      {/* Halos d'ambiance : purement décoratifs, ils restent sous le contenu
          et hors du flux de lecture. */}
      <div
        className="aurora pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
      />
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <SiteHeader user={user} />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
