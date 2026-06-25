"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  Copy,
  CreditCard,
  ExternalLink,
  Lock,
  Smartphone,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ordersAPI, paymentsAPI } from "@/lib/api";

const methods = [
  {
    id: "wallet",
    label: "Wallet",
    icon: Wallet,
    color: "bg-amber-100 text-amber-600",
  },
  {
    id: "payme",
    label: "Payme",
    icon: Smartphone,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "click",
    label: "Click",
    icon: Building2,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "uzum",
    label: "Uzum Bank",
    icon: Building2,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "visa",
    label: "Visa",
    icon: CreditCard,
    color: "bg-red-100 text-red-600",
  },
  {
    id: "mastercard",
    label: "Mastercard",
    icon: CreditCard,
    color: "bg-orange-100 text-orange-600",
  },
] as const;

export default function PaymentPage() {
  const { id } = useParams();
  const orderId = id as string;
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string>("wallet");
  const [processing, setProcessing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [orderRes, paymentsRes] = await Promise.all([
        ordersAPI.getById(orderId),
        paymentsAPI.getPayments({ order: orderId }),
      ]);
      const paymentList = Array.isArray(paymentsRes.data)
        ? paymentsRes.data
        : paymentsRes.data?.results || [];

      setOrder(orderRes.data);
      setPayment(paymentList[0] || null);
      if (paymentList[0]?.method) {
        setSelectedMethod(paymentList[0].method);
      }
    } catch {
      toast.error("Failed to load payment details");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCopyUrl = async () => {
    if (!payment?.payment_url) return;
    try {
      await navigator.clipboard.writeText(payment.payment_url);
      toast.success("Payment link copied");
    } catch {
      toast.error("Failed to copy payment link");
    }
  };

  const handlePay = async () => {
    if (!selectedMethod) {
      toast.error("Select a payment method");
      return;
    }
    if (!payment?.id) {
      toast.error("Payment is not ready for this order yet");
      return;
    }

    setProcessing(true);
    try {
      const response = await paymentsAPI.pay(payment.id, {
        method: selectedMethod,
      });
      const updatedPayment = response.data;
      setPayment(updatedPayment);

      if (updatedPayment.payment_url) {
        window.open(
          updatedPayment.payment_url,
          "_blank",
          "noopener,noreferrer",
        );
        toast.success("Payment link opened in a new tab");
      } else {
        toast.success("Payment started successfully");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  const amount = Number(
    order?.final_price || order?.budget || payment?.amount || 0,
  );
  const paymentStatus = payment?.status || "pending";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="page-container py-6 max-w-lg mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 mb-4"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <h1 className="text-2xl font-bold mb-6">Payment</h1>

        {loading ? (
          <CardSkeleton />
        ) : !order ? (
          <div className="card p-6 text-center text-gray-500">
            Order not found
          </div>
        ) : (
          <>
            <div className="card p-5 mb-6">
              <p className="text-sm text-gray-500">Order</p>
              <p className="text-lg font-semibold mt-1">{order.title}</p>
              <p className="text-3xl font-bold mt-3">
                {amount.toLocaleString()} UZS
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm capitalize">
                  Order: {order.status?.replace(/_/g, " ")}
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-sm capitalize">
                  Payment: {paymentStatus}
                </span>
              </div>
            </div>

            {payment?.payment_url && (
              <div className="card p-4 mb-6 border border-blue-200 dark:border-blue-800/30 bg-blue-50/70 dark:bg-blue-900/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold mb-1">
                      External payment link ready
                    </p>
                    <p className="text-sm text-gray-500 break-all">
                      {payment.payment_url}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyUrl}
                      icon={<Copy size={14} />}
                    >
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        window.open(
                          payment.payment_url,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      icon={<ExternalLink size={14} />}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <h2 className="font-semibold mb-3">Select payment method</h2>
            <div className="space-y-3 mb-6">
              {methods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full card p-4 flex items-center gap-4 transition-all ${
                      selectedMethod === method.id ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${method.color}`}
                    >
                      <Icon size={22} />
                    </div>
                    <span className="font-medium flex-1 text-left">
                      {method.label}
                    </span>
                    {selectedMethod === method.id && (
                      <CheckCircle size={20} className="text-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Lock size={14} />
              <span>
                Your payment is secured and held until work is completed.
              </span>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handlePay}
                loading={processing}
                disabled={
                  loading || !payment?.id || order.status !== "accepted"
                }
                className="w-full"
              >
                {processing
                  ? "Processing payment..."
                  : `Pay ${amount.toLocaleString()} UZS`}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/orders/${orderId}`)}
              >
                Back to order
              </Button>
            </div>

            {order.status !== "accepted" && (
              <p className="text-sm text-gray-500 text-center mt-4">
                Payment becomes available after a master is selected and the
                order is accepted.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
