"use client";

import Link from "next/link";
import { Bell, User, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/auth";
import { useLocaleStore } from "@/store/locale";
import { notificationsAPI } from "@/lib/api";
import { useEffect, useState } from "react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      notificationsAPI.unreadCount().then(res => setUnreadCount(res.data.count)).catch(() => {});
    }
  }, [isAuthenticated]);

  const navLinks = [
    { href: "/categories", label: "Services" },
    { href: "/masters", label: "Masters" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    ...(user?.role === "master" ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ...(isAuthenticated ? [
      { href: "/orders", label: "My Orders" },
      { href: "/profile", label: "Profile" },
      { href: "/settings", label: "Settings" },
    ] : [
      { href: "/login", label: "Sign In" },
      { href: "/register", label: "Sign Up" },
    ]),
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-100 dark:border-gray-800">
      <div className="page-container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <span className="font-bold text-xl">UstaGo</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/categories" className="btn-ghost">Services</Link>
          <Link href="/masters" className="btn-ghost">Masters</Link>
          {user?.role === "master" && (
            <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="btn-ghost p-2 hidden sm:block">
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {isAuthenticated ? (
            <>
              <Link href="/notifications" className="btn-ghost p-2 relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-[10px] text-white flex items-center justify-center">{unreadCount}</span>
                )}
              </Link>
              <div className="relative hidden sm:block">
                <button onClick={() => setMenuOpen(!menuOpen)} className="btn-ghost p-2">
                  <User size={20} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 card p-2 shadow-lg animate-fade-in">
                    <Link href="/profile" className="block px-3 py-2 rounded-[12px] hover:bg-gray-100 dark:hover:bg-dark-50 text-sm">Profile</Link>
                    <Link href="/orders" className="block px-3 py-2 rounded-[12px] hover:bg-gray-100 dark:hover:bg-dark-50 text-sm">My Orders</Link>
                    <Link href="/settings" className="block px-3 py-2 rounded-[12px] hover:bg-gray-100 dark:hover:bg-dark-50 text-sm">Settings</Link>
                    <hr className="my-1 border-gray-100 dark:border-gray-800" />
                    <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-[12px] hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-danger flex items-center gap-2">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="items-center gap-2 hidden sm:flex">
              <Link href="/login" className="btn-ghost">Sign In</Link>
              <Link href="/register" className="btn-primary text-sm px-4 py-2">Sign Up</Link>
            </div>
          )}

          <button onClick={() => setMobileNavOpen(true)} className="btn-ghost p-2 md:hidden">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-dark shadow-xl animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <span className="font-bold">Menu</span>
              <button onClick={() => setMobileNavOpen(false)} className="btn-ghost p-2"><X size={20} /></button>
            </div>
            <nav className="p-4 space-y-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMobileNavOpen(false)}
                  className="block px-4 py-3 rounded-[12px] hover:bg-gray-100 dark:hover:bg-dark-50 font-medium">
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <button onClick={() => { logout(); setMobileNavOpen(false); }}
                  className="w-full text-left px-4 py-3 rounded-[12px] hover:bg-red-50 dark:hover:bg-red-900/20 text-danger font-medium mt-4">
                  Logout
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
