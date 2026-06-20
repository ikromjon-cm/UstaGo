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
    <Link href={`/categories/${id}`} className="flex flex-col items-center gap-2 p-3 card-hover">
      <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-[14px] flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <span className="text-xs font-medium text-center leading-tight">{title_uz}</span>
    </Link>
  );
}
