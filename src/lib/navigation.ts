export type NavSection = "MAIN" | "OPERATIONS" | "AI & AUTOMATION" | "WORKSPACE";

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  section: NavSection;
  description?: string;
};

export const navigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    section: "MAIN",
    description: "Today’s pulse across chats, bookings, and AI.",
  },
  {
    label: "Chat",
    href: "/chat",
    icon: "chat",
    section: "MAIN",
    description: "Manage customer conversations and handovers.",
  },
  {
    label: "Reservations",
    href: "/reservations",
    icon: "event",
    section: "MAIN",
    description: "Manage bookings, availability, and table assignments.",
  },
  {
    label: "Customers",
    href: "/customers",
    icon: "group",
    section: "MAIN",
    description: "Profiles, visit history, tags, and lifetime value.",
  },
  {
    label: "Area",
    href: "/area",
    icon: "map",
    section: "OPERATIONS",
    description: "Manage dining areas and table capacity.",
  },
  {
    label: "Menu",
    href: "/menu",
    icon: "restaurant_menu",
    section: "OPERATIONS",
    description: "Manage your menu, categories, prices, and item images.",
  },
  {
    label: "AI Assistant",
    href: "/prompt",
    icon: "psychology",
    section: "AI & AUTOMATION",
    description: "Configure how your AI assistant communicates with customers.",
  },
  {
    label: "Knowledge",
    href: "/knowledge",
    icon: "menu_book",
    section: "AI & AUTOMATION",
    description: "Policies and FAQs your AI assistant can look up.",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: "monitoring",
    section: "AI & AUTOMATION",
    description: "Revenue, bookings, guests, and AI performance in one report.",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "settings",
    section: "WORKSPACE",
    description: "WhatsApp, automations, and reservation booking rules.",
  },
];

export const navigationSections: NavSection[] = [
  "MAIN",
  "OPERATIONS",
  "AI & AUTOMATION",
  "WORKSPACE",
];

export type PageMeta = {
  title: string;
  description?: string;
};

export function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getPageMeta(pathname: string): PageMeta {
  const item = navigation.find((entry) => isNavItemActive(pathname, entry.href));

  if (!item) {
    return { title: "DIUK" };
  }

  return {
    title: item.label,
    description: item.description,
  };
}
