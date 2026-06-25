"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, Banknote, DollarSign, Wallet } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { CardSkeleton, ListSkeleton } from "@/components/ui/Skeleton";
import { walletAPI } from "@/lib/api";
import { Transaction, Wallet as WalletType } from "@/types";

export default function EarningsPage() {
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
      toast.error("Failed to load earnings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const incomeTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        ["deposit", "payment", "refund", "bonus"].includes(transaction.type),
      ),
    [transactions],
  );

  const formatMoney = (value: number) =>
    `${Number(value || 0).toLocaleString()} UZS`;

  return (
    <div className="min-h-screen">
      <main className="page-container py-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Earnings</h1>
          <Button variant="outline" size="sm" onClick={loadData}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="space-y-6">
            <CardSkeleton />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
            <ListSkeleton count={4} />
          </div>
        ) : (
          <>
            <div className="card p-6 mb-6 text-center bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
              <p className="text-sm text-white/80 mb-2">Total Earned</p>
              <p className="text-4xl font-bold mb-2">
                {formatMoney(Number(wallet?.total_earned || 0))}
              </p>
              <p className="text-sm text-white/80">
                Available for payout:{" "}
                {formatMoney(Number(wallet?.balance || 0))}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                {
                  label: "Available",
                  value: wallet?.balance || 0,
                  icon: Wallet,
                  color: "text-blue-600 bg-blue-100",
                },
                {
                  label: "On Hold",
                  value: wallet?.hold_balance || 0,
                  icon: DollarSign,
                  color: "text-amber-600 bg-amber-100",
                },
                {
                  label: "Withdrawn",
                  value: wallet?.total_withdrawn || 0,
                  icon: Banknote,
                  color: "text-red-600 bg-red-100",
                },
              ].map((item) => (
                <div key={item.label} className="card p-4 text-center">
                  <div
                    className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${item.color} mx-auto mb-2`}
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

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Income</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.assign("/wallet")}
                >
                  Open wallet
                </Button>
              </div>

              {incomeTransactions.length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                  No earnings yet
                </p>
              ) : (
                <div className="space-y-3">
                  {incomeTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-green-100 text-green-600">
                          <ArrowDownLeft size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-sm capitalize">
                            {transaction.description || transaction.type}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(
                              transaction.created_at,
                            ).toLocaleDateString()}{" "}
                            • {transaction.status}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-green-600">
                        +{formatMoney(Number(transaction.amount))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
