import Link from "next/link";
import {
  BarChart3,
  Bell,
  Building2,
  FileArchive,
  FileText,
  Home,
  Landmark,
  PackageCheck,
  ReceiptText,
  Search,
  Settings,
  WalletCards,
  Wrench,
  Droplets
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/flats", label: "Flats", icon: Landmark },
  { href: "/rent", label: "Rent Collection", icon: WalletCards },
  { href: "/expenses", label: "Flat Expenses", icon: Wrench },
  { href: "/building-expenses", label: "Building Expenses", icon: ReceiptText },
  { href: "/water-tankers", label: "Water Tankers", icon: Droplets },
  { href: "/purchases", label: "Purchases", icon: PackageCheck },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/documents", label: "Documents", icon: FileArchive },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="no-print sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-[#111719]/95 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center justify-between px-4 lg:h-20 lg:px-6">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-pine text-white">
              <Building2 size={20} />
            </span>
            <span>
              <span className="block leading-tight">Property Ledger</span>
              <span className="block text-xs font-medium text-slate-500">Pro</span>
            </span>
          </Link>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible lg:px-4">
          {nav.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className="flex min-w-fit items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1">
        <header className="no-print sticky top-0 z-10 hidden h-20 items-center justify-between border-b border-slate-200 bg-mist/90 px-8 backdrop-blur dark:border-slate-800 dark:bg-[#101416]/90 lg:flex">
          <div className="flex w-full max-w-xl items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <Search size={18} />
            <input className="w-full border-0 bg-transparent p-0 focus:ring-0" placeholder="Search flats, tenants, vendors, bills, assets..." />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-coral" />
            </button>
            <ThemeToggle />
          </div>
        </header>
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
