import {
  CreditCardIcon,
  FileTextIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  NetworkIcon,
  RadarIcon,
  SettingsIcon,
  ShieldAlertIcon,
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

export const appName = "Outpost";
export const appTagline = "External Attack Surface";

export const navGroups: NavGroup[] = [
  {
    label: "Surveillance",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboardIcon },
      { title: "Surface d'attaque", href: "/attack-surface", icon: NetworkIcon },
      {
        title: "Vulnérabilités",
        href: "/vulnerabilities",
        icon: ShieldAlertIcon,
      },
      { title: "Fuites de données", href: "/data-leaks", icon: KeyRoundIcon },
      { title: "Scans", href: "/scans", icon: RadarIcon },
    ],
  },
  {
    label: "Pilotage",
    items: [
      { title: "Rapports", href: "/reports", icon: FileTextIcon },
      { title: "Facturation", href: "/billing", icon: CreditCardIcon },
      { title: "Paramètres", href: "/settings", icon: SettingsIcon },
    ],
  },
];
