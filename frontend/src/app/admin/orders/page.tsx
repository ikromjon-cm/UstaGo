"use client";

import { useEffect, useState } from "react";
import { Eye, XCircle } from "lucide-react";
import { ordersAPI } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  looking_master: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  offered: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  accepted: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  disputed: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelOrder, setCancelOrder] = useState<any | null>(null);
  const router = useRouter();

  const load = () => {
    setLoading(true);
    ordersAPI.getAll()
      .then(res => setOrders(res.data.results || res.data))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async () => {
    if (!cancelOrder) return;
    try {
      await ordersAPI.cancel(cancelOrder.id);
      toast.success("Order cancelled");
      setCancelOrder(null);
      load();
    } catch {
      toast.error("Failed to cancel order");
    }
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (o: any) => (
        <span className="font-medium truncate max-w-[200px] block">{o.title}</span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (o: any) => o.customer_detail?.full_name || o.customer || "—",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (o: any) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status] || "bg-gray-100 text-gray-800"}`}>
          {o.status_display || o.status}
        </span>
      ),
    },
    {
      key: "budget",
      label: "Budget",
      sortable: true,
      render: (o: any) => (o.budget ? `${Number(o.budget).toLocaleString()} so'm` : "—"),
    },
    {
      key: "master",
      label: "Master",
      render: (o: any) => o.master_detail?.user?.full_name || o.master || "—",
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (o: any) => new Date(o.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (o: any) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye size={14} />}
            onClick={() => router.push(`/orders/${o.id}`)}
            className="text-blue-500 hover:text-blue-700"
          />
          {o.status === "pending" || o.status === "looking_master" || o.status === "offered" ? (
            <Button
              variant="ghost"
              size="sm"
              icon={<XCircle size={14} />}
              onClick={() => setCancelOrder(o)}
              className="text-red-500 hover:text-red-700"
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order Management</h1>
      </header>
      <main className="p-6">
        {loading ? <TableSkeleton rows={6} /> : (
          <DataTable
            columns={columns}
            data={orders}
            loading={false}
            searchable
            emptyMessage="No orders found"
          />
        )}
      </main>

      {cancelOrder && (
        <ConfirmDialog
          open
          onClose={() => setCancelOrder(null)}
          onConfirm={handleCancel}
          title="Cancel Order"
          message={`Are you sure you want to cancel "${cancelOrder.title}"?`}
          confirmText="Cancel Order"
          variant="danger"
        />
      )}
    </div>
  );
}
