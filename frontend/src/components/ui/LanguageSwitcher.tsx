"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLocaleStore } from "@/store/locale";

export default function LanguageSwitcher() {
  const { locale } = useTranslation();
  const setLocale = useLocaleStore((s) => s.setLocale);

  const labels: Record<string, string> = { uz: "O'zbek", ru: "Русский", en: "English" };

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as any)}
      className="bg-transparent text-sm border border-gray-200 dark:border-gray-700 rounded-[10px] px-3 py-1.5 cursor-pointer"
    >
      {Object.entries(labels).map(([key, label]) => (
        <option key={key} value={key}>{label}</option>
      ))}
    </select>
  );
}
