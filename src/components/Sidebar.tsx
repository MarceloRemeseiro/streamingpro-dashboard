"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuLayoutDashboard, LuMonitor, LuLink, LuRadio, LuDatabase } from "react-icons/lu";
import ThemeToggle from "./ThemeToggle";

const menuItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LuLayoutDashboard,
    path: "/"
  },
  {
    href: "/devices",
    label: "Dispositivos",
    icon: LuMonitor,
    path: "/devices"
  },
  {
    href: "/urls",
    label: "URLs",
    icon: LuLink,
    path: "/urls"
  },
  {
    href: "/central",
    label: "Central",
    icon: LuRadio,
    path: "/central"
  },
  {
    href: "/databases",
    label: "Bases de datos",
    icon: LuDatabase,
    path: "/databases"
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-64 border-r border-gray-200 dark:border-gray-800 p-4 fixed h-full bg-white dark:bg-gray-900">
      <div className="flex justify-between items-center mb-8">
        <div className="text-blue-600 dark:text-blue-400 text-2xl font-bold">StreamingPro</div>
        <ThemeToggle />
      </div>

      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" 
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 