import * as React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <div
        className="aurora pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
