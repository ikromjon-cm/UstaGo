"use client";

import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUp, ArrowDown } from "lucide-react";

export default function AdminAnalyticsPage() {
  const stats = [
    { label: "Total Revenue", value: "45.8M UZS", change: "+12.5%", up: true, icon: DollarSign, color: "green" },
    { label: "Active Users", value: "2,847", change: "+8.1%", up: true, icon: Users, color: "blue" },
    { label: "Total Orders", value: "1,234", change: "+23.4%", up: true, icon: ShoppingBag, color: "purple" },
    { label: "Avg. Rating", value: "4.7", change: "-0.2%", up: false, icon: TrendingUp, color: "yellow" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      <header className="bg-white dark:bg-dark-50 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold">Analytics</h1>
      </header>
      <main className="p-6">
        <div className="grid grid-cols-4 gap-6 mb-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-[14px] bg-${s.color}-100 flex items-center justify-center`}>
                    <Icon className={`text-${s.color}-600`} size={24} />
                  </div>
                  <span className={`flex items-center gap-1 text-sm ${s.up ? 'text-green-500' : 'text-red-500'}`}>
                    {s.up ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    {s.change}
                  </span>
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
              {['Plumbing (28%)', 'Electrical (22%)', 'Cleaning (18%)', 'Repair (15%)', 'Other (17%)'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-dark rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: item.match(/\d+/)?.[0] + '%' }} />
                  </div>
                  <span className="text-sm w-32">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: 'New order created', time: '2 min ago' },
                { action: 'Payment completed', time: '15 min ago' },
                { action: 'New master registered', time: '1 hour ago' },
                { action: 'Order #1234 completed', time: '2 hours ago' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-sm">{item.action}</span>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
