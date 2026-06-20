"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { walletAPI } from "@/lib/api";
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet, Banknote } from "lucide-react";

export default function EarningsPage() {
  const [wallet, setWallet] = useState<any>({ balance: 0, hold_balance: 0, total_earned: 0, total_withdrawn: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      walletAPI.getBalance().then(r => setWallet(r.data)),
      walletAPI.getTransactions().then(r => setTransactions(r.data.results || r.data)),
    ]).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Earnings</h1>

        <div className="card p-6 mb-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Available Balance</p>
          <p className="text-4xl font-bold text-primary mb-4">{Number(wallet.balance).toLocaleString()} UZS</p>
          <button className="btn-primary">Withdraw Funds</button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "On Hold", value: wallet.hold_balance, icon: Wallet, color: "text-yellow-600 bg-yellow-100" },
            { label: "Total Earned", value: wallet.total_earned, icon: DollarSign, color: "text-green-600 bg-green-100" },
            { label: "Withdrawn", value: wallet.total_withdrawn, icon: Banknote, color: "text-blue-600 bg-blue-100" },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${s.color} mx-auto mb-2`}>
                <s.icon size={18} />
              </div>
              <p className="text-lg font-bold">{Number(s.value).toLocaleString()}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Transaction History</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${
                      t.type === 'deposit' || t.type === 'payment' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {t.type === 'deposit' || t.type === 'payment' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div>
                      <p className="font-medium text-sm capitalize">{t.type}</p>
                      <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${t.type === 'deposit' || t.type === 'payment' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'deposit' || t.type === 'payment' ? '+' : '-'}{Number(t.amount).toLocaleString()} UZS
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      t.status === 'completed' ? 'bg-green-100 text-green-700' :
                      t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>{t.status}</span>
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
