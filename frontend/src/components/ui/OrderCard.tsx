"use client";

import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";

interface Props {
  id: string;
  title: string;
  status: string;
  budget: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; style: string }> = {
  pending: { label: "Pending", style: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
  looking_master: { label: "Looking", style: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
  offered: { label: "Offers", style: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  accepted: { label: "Accepted", style: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  in_progress: { label: "In Progress", style: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  completed: { label: "Completed", style: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800" },
  cancelled: { label: "Cancelled", style: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800" },
};

export function OrderCard({ id, title, status, budget, created_at }: Props) {
  const config = statusConfig[status] || { label: status, style: "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400" };

  return (
    <Link href={`/orders/${id}`} className="group block">
      <div className="card-hover p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50/0 to-primary-50/30 dark:from-primary-950/0 dark:to-primary-950/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.style}`}>
                {config.label}
              </span>
            </div>
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{title}</h3>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
              {budget && (
                <span className="font-semibold text-gray-900 dark:text-gray-100">{Number(budget).toLocaleString()} UZS</span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-gray-400" />
                {new Date(created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short" })}
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
