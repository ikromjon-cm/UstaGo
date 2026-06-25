"use client";

import { useEffect, useState } from "react";
import { Users, Briefcase, DollarSign, TrendingUp, ShoppingBag, Star } from "lucide-react";
import toast from "react-hot-toast";
import { analyticsAPI } from "@/lib/api";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard().then(res => setData(res.data)).catch(() => toast.error("Yuklashda xatolik"))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Users", value: data?.total_users || 0, icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Total Masters", value: data?.total_masters || 0, icon: Star, color: "text-purple-600 bg-purple-100" },
    { label: "Total Orders", value: data?.total_orders || 0, icon: ShoppingBag, color: "text-green-600 bg-green-100" },
    { label: "Revenue", value: `${(data?.total_revenue || 0).toLocaleString()} UZS`, icon: DollarSign, color: "text-emerald-600 bg-emerald-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      <header className="bg-white dark:bg-dark-50 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </header>
      <main className="p-6">
        {loading ? (
          <div className="grid grid-cols-4 gap-6 mb-8">{[1,2,3,4].map(i => <CardSkeleton key={i} />)}</div>
        ) : (
        <><div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Today</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span>Orders</span><span className="font-bold">{data?.today?.orders || 0}</span></div>
              <div className="flex justify-between"><span>Revenue</span><span className="font-bold">{data?.today?.revenue?.toLocaleString() || 0} UZS</span></div>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-4">This Month</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span>Orders</span><span className="font-bold">{data?.this_month?.orders || 0}</span></div>
              <div className="flex justify-between"><span>Revenue</span><span className="font-bold">{data?.this_month?.revenue?.toLocaleString() || 0} UZS</span></div>
            </div>
          </div>
        </div>
        </>)}
      </main>
    </div>
  );
}
