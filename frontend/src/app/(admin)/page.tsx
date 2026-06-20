"use client";

import { useEffect, useState } from "react";
import { Users, Briefcase, DollarSign, TrendingUp, ShoppingBag, Star, Save, RefreshCw, Settings } from "lucide-react";
import { analyticsAPI, settingsAPI } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [commission, setCommission] = useState("10");
  const [minPayout, setMinPayout] = useState("50000");
  const [maxDistance, setMaxDistance] = useState("50");
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    analyticsAPI.getDashboard().then(res => setData(res.data)).catch(() => {});
    settingsAPI.getSettings().then(res => {
      if (res.data) {
        setCommission(String(res.data.platform_commission || 10));
        setMinPayout(String(res.data.min_payout || 50000));
        setMaxDistance(String(res.data.max_distance_km || 50));
      }
    }).catch(() => {});
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await settingsAPI.updateSettings({
        platform_commission: parseFloat(commission),
        min_payout: parseFloat(minPayout),
        max_distance_km: parseFloat(maxDistance),
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: "Total Users", value: data?.total_users || 0, icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Total Masters", value: data?.total_masters || 0, icon: Star, color: "text-purple-600 bg-purple-100" },
    { label: "Total Orders", value: data?.total_orders || 0, icon: ShoppingBag, color: "text-green-600 bg-green-100" },
    { label: "Revenue", value: `${(data?.total_revenue || 0).toLocaleString()} UZS`, icon: DollarSign, color: "text-emerald-600 bg-emerald-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      <header className="bg-white dark:bg-dark-50 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={() => setShowSettings(!showSettings)} className="btn-ghost flex items-center gap-2">
          <Settings size={18} /> Settings
        </button>
      </header>
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {showSettings && (
          <div id="settings" className="card p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Settings size={20} />
              <h2 className="text-lg font-semibold">Platform Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Commission (%)</label>
                <input type="number" value={commission} onChange={(e) => setCommission(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Min Payout (UZS)</label>
                <input type="number" value={minPayout} onChange={(e) => setMinPayout(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Distance (km)</label>
                <input type="number" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} className="input" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={saveSettings} disabled={saving} className="btn-primary flex items-center gap-2">
                <Save size={16} /> {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => { setCommission("10"); setMinPayout("50000"); setMaxDistance("50"); }} className="btn-ghost flex items-center gap-2">
                <RefreshCw size={16} /> Reset
              </button>
            </div>
          </div>
        )}

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
      </main>
    </div>
  );
}
