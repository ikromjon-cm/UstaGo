"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Lock,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { walletAPI } from "@/lib/api";
import { Transaction, Wallet as WalletType } from "@/types";

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions(),
      ]);

      const transactionResults = Array.isArray(transactionsRes.data)
        ? transactionsRes.data
        : transactionsRes.data?.results || [];

      setWallet(walletRes.data);
      setTransactions(transactionResults);
    } catch {
      toast.error("Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatMoney = (value: number) =>
    `${Number(value || 0).toLocaleString()} UZS`;

  const transactionColor = (type: string) => {
    if (type === "deposit" || type === "refund" || type === "bonus") {
      return "text-green-600 bg-green-100";
    }
    if (type === "withdrawal") {
      return "text-red-600 bg-red-100";
    }
    return "text-blue-600 bg-blue-100";
  };

  const transactionIcon = (type: string) => {
    if (type === "deposit" || type === "refund" || type === "bonus") {
      return <ArrowDownLeft size={18} className="text-green-600" />;
    }
    return <ArrowUpRight size={18} className="text-red-600" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <Button variant="outline" size="sm" onClick={loadData}>
          Refresh
        </Button>
      </div>

      <div className="card p-6 mb-6 bg-gradient-to-br from-primary to-primary-700 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Wallet size={24} />
          <span className="text-sm opacity-80">Available Balance</span>
        </div>
        <p className="text-4xl font-bold mb-3">
          {loading ? "..." : formatMoney(Number(wallet?.balance || 0))}
        </p>
        <p className="text-sm text-white/80 max-w-xl">
          Funds are held securely until orders are completed. Deposits, payouts,
          refunds, and escrow movements will appear below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "On Hold",
            value: wallet?.hold_balance || 0,
            icon: Lock,
            tone: "text-amber-600 bg-amber-100",
          },
          {
            label: "Total Earned",
            value: wallet?.total_earned || 0,
            icon: DollarSign,
            tone: "text-green-600 bg-green-100",
          },
          {
            label: "Withdrawn",
            value: wallet?.total_withdrawn || 0,
            icon: ArrowUpRight,
            tone: "text-blue-600 bg-blue-100",
          },
        ].map((item) => (
          <div key={item.label} className="card p-4 text-center">
            <div
              className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${item.tone} mx-auto mb-2`}
            >
              <item.icon size={18} />
            </div>
            <p className="text-lg font-bold">
              {formatMoney(Number(item.value))}
            </p>
            <p className="text-xs text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Transaction History</h2>
        {transactions.length > 0 && (
          <span className="text-sm text-gray-500">
            {transactions.length} entries
          </span>
        )}
      </div>

      {loading ? (
        <ListSkeleton count={4} />
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 card">
          <DollarSign size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => {
            const positive =
              tx.type === "deposit" ||
              tx.type === "refund" ||
              tx.type === "bonus";
            return (
              <div
                key={tx.id}
                className="card p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${transactionColor(tx.type)}`}
                  >
                    {transactionIcon(tx.type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm capitalize">
                      {tx.description || tx.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.created_at).toLocaleDateString()} •{" "}
                      {tx.status}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold ${positive ? "text-green-600" : "text-red-600"}`}
                >
                  {positive ? "+" : "-"}
                  {formatMoney(Number(tx.amount))}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
