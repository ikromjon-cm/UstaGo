"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, Settings, TrendingUp, ChevronLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Analytics", href: "/admin/analytics", icon: TrendingUp },
  { label: "Settings", href: "#settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'super_admin') {
      router.replace('/');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark flex">
      {sidebarOpen && (
        <aside className="w-64 bg-white dark:bg-dark-50 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-lg">Admin Panel</h2>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {adminNav.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>
      )}
      <div className="flex-1">
        <Header />
        {children}
      </div>
    </div>
  );
}
