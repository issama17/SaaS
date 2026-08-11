import {
  ChartColumnIcon,
  CreditCardIcon,
  FolderIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const appName = "Acme SaaS";

export const navGroups: NavGroup[] = [
  {
    label: "Général",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboardIcon },
      { title: "Projets", href: "/projects", icon: FolderIcon },
      { title: "Analytics", href: "/analytics", icon: ChartColumnIcon },
      { title: "Clients", href: "/customers", icon: UsersIcon },
    ],
  },
  {
    label: "Compte",
    items: [
      { title: "Facturation", href: "/billing", icon: CreditCardIcon },
      { title: "Paramètres", href: "/settings", icon: SettingsIcon },
      { title: "Support", href: "/support", icon: LifeBuoyIcon },
    ],
  },
];
