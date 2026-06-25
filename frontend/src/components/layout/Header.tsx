"use client";

import Link from "next/link";
import { Bell, User, LogOut, Menu, Moon, Sun, X, LayoutDashboard, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/auth";
import { notificationsAPI } from "@/lib/api";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      notificationsAPI.unreadCount().then(res => setUnreadCount(res.data.count)).catch(() => toast.error("Yuklashda xatolik"));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinks = [
    { href: "/categories", label: "Services" },
    { href: "/masters", label: "Masters" },
    { href: "/about", label: "About" },
    ...(user?.role === "master" ? [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/schedule", label: "Schedule" },
      { href: "/portfolio", label: "Portfolio" },
    ] : []),
  ];

  const userMenuItems = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/orders", label: "My Orders" },
    ...(user?.role === "master" ? [
      { href: "/schedule", label: "Schedule" },
      { href: "/portfolio", label: "Portfolio" },
    ] : []),
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-gray-100/50 dark:border-gray-800/50">
      <div className="page-container flex items-center justify-between h-16 md:h-18">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-600 rounded-[12px] flex items-center justify-center shadow-sm shadow-primary/20 group-hover:shadow-md group-hover:shadow-primary/30 transition-all duration-300">
            <span className="text-white font-extrabold text-base">U</span>
          </div>
          <span className="font-extrabold text-xl tracking-tight">UstaGo</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="btn-ghost">{link.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="btn-ghost p-2.5 hidden sm:flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-dark-50 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <Link href="/notifications" className="btn-ghost p-2.5 relative rounded-xl hover:bg-gray-100 dark:hover:bg-dark-50 transition-all duration-200">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gradient-to-br from-danger to-red-600 rounded-full text-[10px] text-white font-bold flex items-center justify-center px-1 shadow-sm shadow-danger/30">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <div className="relative hidden sm:block" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-50 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary-600 rounded-[10px] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user?.full_name?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <User size={14} className="text-gray-400" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 card p-1.5 shadow-xl shadow-black/5 border-gray-100 dark:border-gray-800 animate-scale-in">
                    <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800 mb-1">
                      <p className="text-sm font-semibold truncate">{user?.full_name || "User"}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role || "customer"}</p>
                    </div>
                    {userMenuItems.map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] hover:bg-gray-100 dark:hover:bg-dark-50 text-sm transition-colors">
                        {item.icon && <item.icon size={16} className="text-gray-400" />}
                        {item.label}
                      </Link>
                    ))}
                    <hr className="my-1 border-gray-100 dark:border-gray-800" />
                    <button onClick={() => { logout(); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-danger transition-colors">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="items-center gap-2 hidden sm:flex">
              <Link href="/login" className="btn-ghost text-sm px-4 py-2">Sign In</Link>
              <Link href="/register" className="btn-primary text-sm px-5 py-2.5 bg-gradient-to-br from-primary to-primary-600 hover:shadow-lg hover:shadow-primary/25">Sign Up</Link>
            </div>
          )}

          <button onClick={() => setMobileNavOpen(true)} className="btn-ghost p-2.5 md:hidden rounded-xl">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-dark shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-600 rounded-[10px] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <span className="font-bold text-lg">UstaGo</span>
              </div>
              <button onClick={() => setMobileNavOpen(false)} className="btn-ghost p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-50"><X size={20} /></button>
            </div>
            {isAuthenticated && (
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-primary-50/50 to-transparent dark:from-primary-950/20">
                <p className="font-semibold">{user?.full_name || "User"}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role || "customer"}</p>
              </div>
            )}
            <nav className="p-3 space-y-0.5">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-[12px] hover:bg-gray-100 dark:hover:bg-dark-50 font-medium transition-colors">
                  {link.icon && <link.icon size={18} className="text-gray-400" />}
                  {link.label}
                </Link>
              ))}
            </nav>
            <hr className="mx-3 border-gray-100 dark:border-gray-800" />
            <nav className="p-3 space-y-0.5">
              {isAuthenticated ? (
                <>
                  <Link href="/orders" onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-[12px] hover:bg-gray-100 dark:hover:bg-dark-50 font-medium transition-colors">My Orders</Link>
                  <Link href="/profile" onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-[12px] hover:bg-gray-100 dark:hover:bg-dark-50 font-medium transition-colors">Profile</Link>
                  <Link href="/settings" onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-[12px] hover:bg-gray-100 dark:hover:bg-dark-50 font-medium transition-colors"><Settings size={18} className="text-gray-400" /> Settings</Link>
                  <button onClick={() => { logout(); setMobileNavOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] hover:bg-red-50 dark:hover:bg-red-900/20 text-danger font-medium transition-colors mt-2">
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-[12px] hover:bg-gray-100 dark:hover:bg-dark-50 font-medium transition-colors">Sign In</Link>
                  <Link href="/register" onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-[12px] bg-primary text-white font-semibold mt-2">Get Started</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
