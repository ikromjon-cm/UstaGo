"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUp, ArrowDown } from "lucide-react";
import toast from "react-hot-toast";
import { analyticsAPI } from "@/lib/api";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [topCats, setTopCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getSummary().then(res => setSummary(res.data)).catch(() => toast.error("Yuklashda xatolik")),
      analyticsAPI.getTopCategories().then(res => setTopCats(res.data)).catch(() => toast.error("Yuklashda xatolik")),
    ]).finally(() => setLoading(false));
  }, []);

  const data = summary?.all_time || {};
  const totalOrders = data.orders || 0;
  const totalRevenue = data.revenue || 0;
  const totalUsers = data.users || 0;
  const totalMasters = data.masters || 0;

  const maxCatOrders = Math.max(...topCats.map(c => c.orders), 1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      <header className="bg-white dark:bg-dark-50 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold">Analytics</h1>
      </header>
      <main className="p-6">
        {loading ? (
          <div className="grid grid-cols-4 gap-6 mb-6">
            {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : (
        <><div className="grid grid-cols-4 gap-6 mb-6">
          {[
            { label: "Total Revenue", value: `${totalRevenue.toLocaleString()} UZS`, icon: DollarSign, color: 'bg-green-100', iconColor: 'text-green-600' },
            { label: "Total Users", value: totalUsers.toLocaleString(), icon: Users, color: 'bg-blue-100', iconColor: 'text-blue-600' },
            { label: "Total Orders", value: totalOrders.toLocaleString(), icon: ShoppingBag, color: 'bg-purple-100', iconColor: 'text-purple-600' },
            { label: "Total Masters", value: totalMasters.toLocaleString(), icon: TrendingUp, color: 'bg-yellow-100', iconColor: 'text-yellow-600' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${s.color}`}>
                    <Icon className={s.iconColor} size={24} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Orders by Category</h3>
            <div className="space-y-3">
              {topCats.length === 0 ? (
                <p className="text-sm text-gray-400">No data yet</p>
              ) : (
                topCats.map((cat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-dark rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(cat.orders / maxCatOrders) * 100}%` }} />
                    </div>
                    <span className="text-sm w-32">{cat.category} ({cat.orders})</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Period Comparison</h3>
            <div className="space-y-4">
              {[
                { label: 'Today', data: summary?.today },
                { label: 'This Week', data: summary?.this_week },
                { label: 'This Month', data: summary?.this_month },
              ].map((period, i) => (
                <div key={i} className="p-3 bg-gray-50 dark:bg-dark rounded-[12px]">
                  <p className="font-medium text-sm mb-2">{period.label}</p>
                  {period.data ? (
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                      <span>{period.data.users} users</span>
                      <span>{period.data.orders} orders</span>
                      <span>{period.data.revenue.toLocaleString()} UZS</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Loading...</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        </>)}
      </main>
    </div>
  );
}
