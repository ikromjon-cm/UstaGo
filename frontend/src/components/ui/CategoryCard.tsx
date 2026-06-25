"use client";

import Link from "next/link";
import { Wrench, Zap, Hammer, PaintBucket, Droplets, Sofa, Tv, Smartphone } from "lucide-react";

const iconMap: Record<string, any> = {
  santexnik: Droplets, elektrik: Zap, svarchik: Hammer, quruvchi: PaintBucket,
  konditsioner: Wrench, mebel: Sofa, tv: Tv, kompyuter: Smartphone,
};

interface Props {
  id: string; title_uz: string; icon: string | null; is_featured: boolean;
}

export function CategoryCard({ id, title_uz, icon }: Props) {
  const Icon = iconMap[title_uz.toLowerCase()] || Wrench;

  return (
    <Link href={`/categories/${id}`} className="group flex flex-col items-center gap-2 p-4 rounded-[16px] bg-white dark:bg-dark-50 border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/0 to-primary-50/50 dark:from-primary-950/0 dark:to-primary-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative w-14 h-14 rounded-[16px] bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-800/20 flex items-center justify-center group-hover:from-primary-100 group-hover:to-primary-200 dark:group-hover:from-primary-800/40 dark:group-hover:to-primary-700/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm group-hover:shadow-primary/20">
        <Icon className="w-6 h-6 text-primary group-hover:text-primary-600 transition-colors" />
      </div>
      <span className="relative text-xs font-semibold text-center leading-tight group-hover:text-primary transition-colors">{title_uz}</span>
    </Link>
  );
}
