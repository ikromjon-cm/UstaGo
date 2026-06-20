"use client";

import Link from "next/link";

interface Props {
  id: string;
  title: string;
  status: string;
  budget: string;
  created_at: string;
}

const statusStyles: Record<string, string> = {
  pending: "badge-warning",
  looking_master: "badge-warning",
  offered: "badge-primary",
  accepted: "badge-primary",
  in_progress: "badge-primary",
  completed: "badge-success",
  cancelled: "badge-danger",
};

export function OrderCard({ id, title, status, budget, created_at }: Props) {
  return (
    <Link href={`/orders/${id}`} className="card-hover p-4 flex items-center justify-between">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className={statusStyles[status] || "badge"}>{status.replace("_", " ")}</span>
          {budget && <span className="text-sm text-gray-500">{Number(budget).toLocaleString()} UZS</span>}
        </div>
      </div>
      <span className="text-xs text-gray-400">{new Date(created_at).toLocaleDateString()}</span>
    </Link>
  );
}
