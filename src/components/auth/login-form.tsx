"use client";

import * as React from "react";
import {
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "@/lib/auth/actions";

const INITIAL: LoginState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = React.useActionState(
    loginAction,
    INITIAL
  );
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {state.error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg px-3 py-2 text-sm"
          style={{
            color: "var(--sev-critical)",
            backgroundColor:
              "color-mix(in oklab, var(--sev-critical) 12%, transparent)",
          }}
        >
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Adresse e-mail professionnelle</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          spellCheck={false}
          defaultValue={state.email}
          placeholder="prenom.nom@entreprise.fr"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOffIcon className="size-3.5" aria-hidden="true" />
            ) : (
              <EyeIcon className="size-3.5" aria-hidden="true" />
            )}
            {showPassword ? "Masquer" : "Afficher"}
          </button>
        </div>
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          placeholder="••••••••••••"
        />
      </div>

      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          <ArrowRightIcon />
        )}
        Se connecter
      </Button>
    </form>
  );
}
