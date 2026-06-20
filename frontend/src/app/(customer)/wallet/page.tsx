"use client";

import { useEffect, useState } from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, DollarSign } from "lucide-react";
import { walletAPI } from "@/lib/api";

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      walletAPI.getBalance().then(r => setBalance(r.data.balance)).catch(() => {}),
      walletAPI.getTransactions().then(r => setTransactions(r.data.results || r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Wallet</h1>

      <div className="card p-6 mb-6 bg-gradient-to-br from-primary to-primary-700 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Wallet size={24} />
          <span className="text-sm opacity-80">Available Balance</span>
        </div>
        <p className="text-4xl font-bold mb-4">{loading ? "..." : `${balance.toLocaleString()} UZS`}</p>
        <div className="flex gap-3">
          <button className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-[12px] text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus size={16} /> Deposit
          </button>
          <button className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-[12px] text-sm font-medium flex items-center gap-2 transition-colors">
            <ArrowUpRight size={16} /> Withdraw
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Transaction History</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="animate-pulse card p-4"><div className="h-4 w-48 skeleton" /></div>)}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx: any) => (
            <div key={tx.id} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${
                  tx.type === 'deposit' ? 'bg-green-100' :
                  tx.type === 'withdrawal' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {tx.type === 'deposit' ? <ArrowDownLeft size={18} className="text-green-600" /> :
                   tx.type === 'withdrawal' ? <ArrowUpRight size={18} className="text-red-600" /> :
                   <DollarSign size={18} className="text-blue-600" />}
                </div>
                <div>
                  <p className="font-medium text-sm">{tx.description || tx.type}</p>
                  <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`font-semibold ${
                tx.type === 'deposit' ? 'text-green-600' :
                tx.type === 'withdrawal' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {tx.type === 'deposit' ? '+' : '-'}{Number(tx.amount).toLocaleString()} UZS
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
