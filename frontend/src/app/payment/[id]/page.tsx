"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreditCard, Smartphone, Building2, Banknote, CheckCircle, Lock, ArrowLeft } from "lucide-react";
import { paymentsAPI, ordersAPI } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import toast from "react-hot-toast";

const methods = [
  { id: "payme", label: "Payme", icon: Smartphone, color: "bg-green-100 text-green-600" },
  { id: "click", label: "Click", icon: Building2, color: "bg-blue-100 text-blue-600" },
  { id: "uzum", label: "Uzum Bank", icon: Building2, color: "bg-purple-100 text-purple-600" },
  { id: "cash", label: "Naqd pul", icon: Banknote, color: "bg-yellow-100 text-yellow-600" },
  { id: "card", label: "Visa / Mastercard", icon: CreditCard, color: "bg-red-100 text-red-600" },
];

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    ordersAPI.getById(id as string).then(r => setOrder(r.data)).catch(() => {});
  }, [id]);

  const handlePay = async () => {
    if (!selectedMethod) { toast.error("To'lov usulini tanlang"); return; }
    setProcessing(true);
    try {
      await paymentsAPI.pay(id as string, { method: selectedMethod });
      toast.success("To'lov muvaffaqiyatli amalga oshirildi!");
      router.push(`/orders/${id}`);
    } catch { toast.error("To'lovda xatolik yuz berdi"); } finally { setProcessing(false); }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6 max-w-lg mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-4">
          <ArrowLeft size={20} /> Back
        </button>

        <h1 className="text-2xl font-bold mb-6">To'lov</h1>

        {order && (
          <div className="card p-4 mb-6">
            <p className="text-sm text-gray-500">Buyurtma: {order.title}</p>
            <p className="text-2xl font-bold mt-1">{Number(order.final_price || order.budget).toLocaleString()} UZS</p>
            <p className="text-xs text-gray-400 mt-1">Komissiya: 10%</p>
          </div>
        )}

        <h2 className="font-semibold mb-3">To'lov usulini tanlang</h2>
        <div className="space-y-3 mb-6">
          {methods.map(m => {
            const Icon = m.icon;
            return (
              <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                className={`w-full card p-4 flex items-center gap-4 transition-all ${selectedMethod === m.id ? 'ring-2 ring-primary' : ''}`}>
                <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${m.color}`}>
                  <Icon size={22} />
                </div>
                <span className="font-medium flex-1 text-left">{m.label}</span>
                {selectedMethod === m.id && <CheckCircle size={20} className="text-primary" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Lock size={14} />
          <span>To'lovlaringiz xavfsiz himoyalangan</span>
        </div>

        <button onClick={handlePay} disabled={processing || !selectedMethod}
          className="btn-primary w-full">
          {processing ? "To'lov amalga oshirilmoqda..." : `To'lash: ${order ? Number(order.final_price || order.budget).toLocaleString() : ''} UZS`}
        </button>
      </main>
    </div>
  );
}
