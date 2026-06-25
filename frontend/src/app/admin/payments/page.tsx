"use client";

import { useEffect, useState } from "react";
import { DollarSign, Search, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { paymentsAPI } from "@/lib/api";
import { CardSkeleton, ListSkeleton } from "@/components/ui/Skeleton";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsAPI.getPayments().then(res => setPayments(res.data.results || res.data)).catch(() => toast.error("Yuklashda xatolik"))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingAmount = payments.filter(p => p.status === 'held').reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      <header className="bg-white dark:bg-dark-50 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold">Payment Management</h1>
      </header>
      <main className="p-6">
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {[1,2,3].map(i => <CardSkeleton key={i} />)}
            </div>
            <ListSkeleton count={5} />
          </div>
        ) : (
        <><div className="grid grid-cols-3 gap-6 mb-6">
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[14px] bg-green-100 flex items-center justify-center"><DollarSign className="text-green-600" size={24} /></div>
              <div><p className="text-sm text-gray-500">Total Revenue</p><p className="text-2xl font-bold">{totalRevenue.toLocaleString()} UZS</p></div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[14px] bg-yellow-100 flex items-center justify-center"><Clock className="text-yellow-600" size={24} /></div>
              <div><p className="text-sm text-gray-500">Pending Release</p><p className="text-2xl font-bold">{pendingAmount.toLocaleString()} UZS</p></div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[14px] bg-blue-100 flex items-center justify-center"><DollarSign className="text-blue-600" size={24} /></div>
              <div><p className="text-sm text-gray-500">Transactions</p><p className="text-2xl font-bold">{payments.length}</p></div>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left p-4 text-sm font-medium text-gray-500">ID</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Master</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Method</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-dark-50">
                  <td className="p-4 text-sm font-mono">{p.id?.slice(0, 8)}</td>
                  <td className="p-4 text-sm">{p.customer_detail?.full_name || p.customer}</td>
                  <td className="p-4 text-sm">{p.master_detail?.full_name || p.master}</td>
                  <td className="p-4 font-medium">{Number(p.amount).toLocaleString()} UZS</td>
                  <td className="p-4"><span className="badge-primary capitalize">{p.method}</span></td>
                  <td className="p-4">
                    <span className={`${
                      p.status === 'completed' ? 'badge-success' :
                      p.status === 'held' ? 'badge-warning' :
                      p.status === 'refunded' ? 'badge-danger' : 'badge'
                    }`}>{p.status}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>)}
      </main>
    </div>
  );
}
