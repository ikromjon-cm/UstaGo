"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Globe, Lock, User, ChevronRight, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useState("uz");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-4">
        <div className="card">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Globe size={20} className="text-gray-400" />
                <div>
                  <p className="font-medium">Language</p>
                  <p className="text-sm text-gray-500">Uzbek</p>
                </div>
              </div>
              <button onClick={() => setLang(lang === 'uz' ? 'ru' : lang === 'ru' ? 'en' : 'uz')} className="btn-ghost p-2">
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon size={20} className="text-gray-400" /> : <Sun size={20} className="text-gray-400" />}
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-500">{theme === 'dark' ? 'On' : 'Off'}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={theme === 'dark'} onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>
            <Link href="/settings/notifications" className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-gray-400" />
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-gray-500">Push, SMS, Email</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Lock size={20} className="text-gray-400" />
                <div>
                  <p className="font-medium">Privacy</p>
                  <p className="text-sm text-gray-500">Password, Security</p>
                </div>
              </div>
              <button className="btn-ghost p-2"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 text-danger">
            <User size={20} />
            <span className="font-medium">Delete Account</span>
          </div>
        </div>
      </div>
    </div>
  );
}
