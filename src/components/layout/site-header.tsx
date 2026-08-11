import { SearchIcon } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-[var(--glass-border)] bg-background/70 px-4 backdrop-blur-xl">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-1 data-vertical:h-4 data-vertical:self-auto"
      />

      <div className="relative hidden w-full max-w-sm sm:block">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un domaine, une IP, une CVE…"
          className="h-8 pl-8"
          aria-label="Rechercher"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ModeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
