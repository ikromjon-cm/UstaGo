"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import toast from "react-hot-toast";
import { ordersAPI } from "@/lib/api";
import { ListSkeleton } from "@/components/ui/Skeleton";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "badge-warning", icon: Clock },
  looking_master: { label: "Looking for Master", color: "badge-warning", icon: Clock },
  offered: { label: "Offer Received", color: "badge-primary", icon: AlertCircle },
  accepted: { label: "Accepted", color: "badge-primary", icon: Clock },
  in_progress: { label: "In Progress", color: "badge-warning", icon: Clock },
  completed: { label: "Completed", color: "badge-success", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "badge-danger", icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getMyOrders().then(res => {
      setOrders(res.data.results || res.data);
    }).catch(() => toast.error("Yuklashda xatolik")).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Orders</h1>
          <Link href="/orders/create" className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
            <Plus size={18} /> New Order
          </Link>
        </div>
        {loading ? (
          <ListSkeleton count={4} />
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-400 mb-4">No orders yet</p>
            <Link href="/orders/create" className="btn-primary">Create your first order</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              return (
                <Link key={order.id} href={`/orders/${order.id}`} className="card-hover p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-dark-50 rounded-[12px] flex items-center justify-center">
                    <StatusIcon size={22} className={config.color.replace('badge-', 'text-')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{order.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{order.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`${config.color} text-xs`}>{config.label}</span>
                      {order.budget && <span className="text-xs text-gray-400">{Number(order.budget).toLocaleString()} UZS</span>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
