"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { ordersAPI, walletAPI, analyticsAPI } from "@/lib/api";
import { DollarSign, ShoppingBag, Star, Briefcase, Power, TrendingUp } from "lucide-react";

export default function MasterDashboardPage() {
  const [stats, setStats] = useState({ balance: 0, totalOrders: 0, earnings: 0, rating: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    walletAPI.getBalance().then(r => setStats(s => ({ ...s, balance: r.data.balance || 0 }))).catch(() => {});
    ordersAPI.getMyOrders().then(r => {
      const data = r.data.results || r.data;
      setOrders(data);
      setStats(s => ({ ...s, totalOrders: data.length }));
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      <Header />
      <main className="page-container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Master Dashboard</h1>
          <button onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-sm font-medium transition-all ${
              isOnline ? "bg-success/10 text-success" : "bg-gray-100 text-gray-500"
            }`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-success" : "bg-gray-400"}`} />
            {isOnline ? "Online" : "Offline"}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Balance", value: `${Number(stats.balance).toLocaleString()} UZS`, icon: DollarSign, color: "text-green-600 bg-green-100" },
            { label: "Orders", value: stats.totalOrders.toString(), icon: ShoppingBag, color: "text-blue-600 bg-blue-100" },
            { label: "Rating", value: stats.rating.toFixed(1), icon: Star, color: "text-yellow-600 bg-yellow-100" },
            { label: "Earnings", value: `${Number(stats.earnings).toLocaleString()} UZS`, icon: TrendingUp, color: "text-purple-600 bg-purple-100" },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${s.color} mb-3`}>
                <s.icon size={20} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Recent Orders</h3>
          {orders.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-[12px]">
                  <div>
                    <p className="font-medium">{order.title}</p>
                    <p className="text-sm text-gray-500">{order.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{Number(order.budget || 0).toLocaleString()} UZS</p>
                    <span className={`text-xs ${
                      order.status === "completed" ? "text-success" :
                      order.status === "in_progress" ? "text-primary" : "text-gray-400"
                    }`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
