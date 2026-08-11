"use client";

import * as React from "react";
import {
  CheckIcon,
  CopyIcon,
  LoaderCircleIcon,
  RadarIcon,
  ScanSearchIcon,
  ShieldPlusIcon,
  UserSearchIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PROFILES = [
  {
    id: "DISCOVERY",
    icon: ScanSearchIcon,
    title: "Découverte",
    description: "Sous-domaines, IP, ports et certificats. Passif, non intrusif.",
    duration: "~3 min",
  },
  {
    id: "FULL",
    icon: RadarIcon,
    title: "Scan complet",
    description: "Découverte puis corrélation CVE, EPSS et catalogue KEV.",
    duration: "~12 min",
  },
  {
    id: "LEAK_MONITORING",
    icon: UserSearchIcon,
    title: "Veille fuites",
    description: "Recherche d'identifiants dans les dumps et stealer logs.",
    duration: "~90 s",
  },
] as const;

type Step = "form" | "submitting" | "done";

export function AddTargetDialog() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>("form");
  const [domain, setDomain] = React.useState("");
  const [profile, setProfile] = React.useState<string>("FULL");
  const [copied, setCopied] = React.useState(false);

  const token = React.useMemo(
    () =>
      `vasseur-verify=${Array.from(domain.replace(/[^a-z0-9]/gi, ""))
        .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 0xffffffff, 7)
        .toString(16)
        .padStart(8, "0")}`,
    [domain]
  );

  function reset() {
    setStep("form");
    setDomain("");
    setProfile("FULL");
    setCopied(false);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!domain.trim()) return;
    setStep("submitting");
    // La persistance viendra de `prisma.targetDomain.create` via une server
    // action ; le délai simule l'aller-retour réseau.
    window.setTimeout(() => setStep("done"), 900);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) window.setTimeout(reset, 200);
      }}
    >
      <DialogTrigger
        render={
          <Button
            size="lg"
            className="h-11 gap-2 px-5 text-sm font-semibold shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_45%,transparent),0_12px_32px_-12px_color-mix(in_oklab,var(--primary)_75%,transparent)] transition-shadow hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_60%,transparent),0_16px_40px_-12px_color-mix(in_oklab,var(--primary)_90%,transparent)]"
          />
        }
      >
        <ShieldPlusIcon className="size-4" />
        Add Target to Scan
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        {step === "done" ? (
          <>
            <DialogHeader>
              <DialogTitle>Périmètre enregistré</DialogTitle>
              <DialogDescription>
                Publiez cet enregistrement TXT sur{" "}
                <span className="font-mono text-foreground">
                  {domain || "votre domaine"}
                </span>{" "}
                pour prouver que vous en êtes propriétaire. Le scan démarre dès
                que la propagation DNS est confirmée.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2 rounded-lg border border-[var(--glass-border)] bg-muted/40 p-3">
              <code className="flex-1 truncate font-mono text-xs">{token}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard?.writeText(token);
                  setCopied(true);
                }}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? "Copié" : "Copier"}
              </Button>
            </div>

            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>Fermer</DialogClose>
              <Button onClick={reset}>Ajouter un autre périmètre</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>Ajouter un périmètre à surveiller</DialogTitle>
              <DialogDescription>
                Un domaine racine suffit : la découverte remonte seule les
                sous-domaines, adresses IP et services exposés.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-2">
              <Label htmlFor="domain">Domaine racine</Label>
              <Input
                id="domain"
                name="domain"
                placeholder="exemple-industries.fr"
                autoComplete="off"
                spellCheck={false}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="font-mono"
              />
            </div>

            <fieldset className="mt-4 space-y-2">
              <legend className="mb-2 text-sm font-medium">
                Profil de scan
              </legend>
              <div className="space-y-2">
                {PROFILES.map((item) => {
                  const Icon = item.icon;
                  const selected = profile === item.id;

                  return (
                    <label
                      key={item.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                        selected
                          ? "border-primary/60 bg-primary/10"
                          : "border-[var(--glass-border)] hover:bg-muted/40"
                      )}
                    >
                      <input
                        type="radio"
                        name="profile"
                        value={item.id}
                        checked={selected}
                        onChange={() => setProfile(item.id)}
                        className="sr-only"
                      />
                      <Icon
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          selected ? "text-primary" : "text-muted-foreground"
                        )}
                        aria-hidden="true"
                      />
                      <span className="flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.duration}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <DialogFooter className="mt-5">
              <DialogClose render={<Button type="button" variant="ghost" />}>
                Annuler
              </DialogClose>
              <Button
                type="submit"
                disabled={!domain.trim() || step === "submitting"}
              >
                {step === "submitting" ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : (
                  <ShieldPlusIcon />
                )}
                Lancer la découverte
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
