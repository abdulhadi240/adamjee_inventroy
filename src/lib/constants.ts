import {
  DashboardIcon,
  InventoryIcon,
  CategoriesIcon,
  ReportsIcon,
  SuppliersIcon,
  OrdersIcon,
  SalesIcon,
  CustomersIcon,
  SettingsIcon,
} from "@/components/icons";
import type { LucideIcon } from "lucide-react";

export const LOW_STOCK_THRESHOLD = 10;

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  links: NavLink[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
      { href: "/reports", label: "Reports", icon: ReportsIcon },
    ],
  },
  {
    title: "Stock",
    links: [
      { href: "/inventory", label: "Inventory", icon: InventoryIcon },
      { href: "/categories", label: "Categories", icon: CategoriesIcon },
      { href: "/orders", label: "Purchase Orders", icon: OrdersIcon },
      { href: "/suppliers", label: "Suppliers", icon: SuppliersIcon },
    ],
  },
  {
    title: "Sales",
    links: [
      { href: "/sales", label: "Sales", icon: SalesIcon },
      { href: "/customers", label: "Customers", icon: CustomersIcon },
    ],
  },
];

export const MAIN_NAV_LINKS: NavLink[] = NAV_SECTIONS.flatMap((s) => s.links);

export const FOOTER_NAV_LINKS: NavLink[] = [
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export const PAYMENT_METHODS = [
  { label: "Cash", value: "Cash" },
  { label: "Bank Transfer", value: "Bank Transfer" },
  { label: "JazzCash", value: "JazzCash" },
  { label: "Easypaisa", value: "Easypaisa" },
  { label: "Card", value: "Card" },
];

export const PAYMENT_STATUSES = [
  { label: "Paid", value: "Paid" },
  { label: "Debt", value: "Debt" },
];

export const ORDER_STATUSES = [
  { label: "Pending", value: "Pending" },
  { label: "Shipped", value: "Shipped" },
  { label: "Completed", value: "Completed" },
];