"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  ShieldAlert,
  Star,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { Header } from "@/components/layout/Header";
import { chatAPI, ordersAPI, paymentsAPI } from "@/lib/api";

export default function OrderDetailPage() {
  const { id } = useParams();
  const orderId = id as string;
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    } catch {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await ordersAPI.acceptOffer(orderId, offerId);
      toast.success("Offer accepted");
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to accept offer");
    }
  };

  const handleConfirmCompletion = async () => {
    try {
      await ordersAPI.confirmCompletion(orderId);
      toast.success("Completion confirmed");
      await loadData();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to confirm completion",
      );
    }
  };

  const handleCancel = async () => {
    try {
      await ordersAPI.cancel(orderId);
      toast.success("Order cancelled");
      router.push("/orders");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleOpenChat = async () => {
    const masterUserId = order?.master_detail?.user?.id;
    if (!masterUserId) {
      toast.error("Master chat is not available yet");
      return;
    }

    try {
      const response = await chatAPI.getOrCreate(masterUserId, orderId);
      router.push(`/chat/${response.data.id}`);
    } catch {
      toast.error("Failed to open chat");
    }
  };

  const handleCall = () => {
    const phone = order?.master_detail?.user?.phone;
    if (!phone) {
      toast.error("Phone number is not available");
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="page-container py-6">
          <div className="skeleton h-96" />
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="page-container py-6">
          <p>Order not found</p>
        </main>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    looking_master: "Looking for Master",
    offered: "Offer Received",
    accepted: "Accepted",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    disputed: "Disputed",
  };

  const paymentLabels: Record<string, string> = {
    pending: "Pending",
    processing: "Processing",
    held: "Held in escrow",
    completed: "Completed",
    refunded: "Refunded",
    failed: "Failed",
    disputed: "Disputed",
  };

  const displayPrice = Number(order.final_price || order.budget || 0);
  const paymentStatus = payment
    ? paymentLabels[payment.status] || payment.status
    : null;
  const masterLinkId = order.master_detail?.id || order.master;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="page-container py-6 max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 mb-4"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="card p-6 mb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{order.title}</h1>
              <p className="text-gray-500 mt-1">
                {order.description || "No description provided"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  order.status === "completed"
                    ? "bg-emerald-100 text-emerald-700"
                    : order.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                }`}
              >
                {statusLabels[order.status] || order.status}
              </span>
              {paymentStatus && (
                <span className="px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700">
                  Payment: {paymentStatus}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-dark-50 rounded-[12px]">
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-gray-400" />
              {order.address}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign size={16} className="text-gray-400" />
              {displayPrice.toLocaleString()} UZS
            </div>
            {order.preferred_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-gray-400" />
                {order.preferred_date}
              </div>
            )}
            {order.preferred_time && (
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-gray-400" />
                {order.preferred_time}
              </div>
            )}
          </div>
        </div>

        {order.master_detail && (
          <div className="card p-6 mb-4">
            <h3 className="font-semibold mb-3">Your Master</h3>
            <Link
              href={masterLinkId ? `/masters/${masterLinkId}` : "#"}
              className="flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-primary to-primary-400 flex items-center justify-center text-white font-bold text-xl">
                {order.master_detail?.user?.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-semibold">
                  {order.master_detail?.user?.full_name || "Master"}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Star size={14} className="text-warning" />
                  {order.master_detail?.rating || "5.0"}
                  <span>•</span>
                  <span>{order.master_detail?.completed_jobs || 0} jobs</span>
                </div>
              </div>
            </Link>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleOpenChat}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle size={16} /> Chat
              </button>
              <button
                onClick={handleCall}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
              >
                <Phone size={16} /> Call
              </button>
            </div>
          </div>
        )}

        {order.offers?.length > 0 && !order.master_detail && (
          <div className="card p-6 mb-4">
            <h3 className="font-semibold mb-4">
              Offers ({order.offers.length})
            </h3>
            <div className="space-y-3">
              {order.offers.map((offer: any) => (
                <div
                  key={offer.id}
                  className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-[12px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold">
                      {offer.master_detail?.user?.full_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {offer.master_detail?.user?.full_name || "Master"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {offer.estimated_duration} min
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {Number(offer.price).toLocaleString()} UZS
                    </p>
                    <button
                      onClick={() => handleAcceptOffer(offer.id)}
                      className="text-sm text-primary font-medium"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {payment && (
          <div className="card p-6 mb-4">
            <h3 className="font-semibold mb-3">Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="rounded-[12px] bg-gray-50 dark:bg-dark-50 p-4">
                <p className="text-gray-500 mb-1">Amount</p>
                <p className="font-semibold">
                  {Number(payment.amount || displayPrice).toLocaleString()} UZS
                </p>
              </div>
              <div className="rounded-[12px] bg-gray-50 dark:bg-dark-50 p-4">
                <p className="text-gray-500 mb-1">Method</p>
                <p className="font-semibold capitalize">
                  {payment.method || "wallet"}
                </p>
              </div>
              <div className="rounded-[12px] bg-gray-50 dark:bg-dark-50 p-4">
                <p className="text-gray-500 mb-1">Status</p>
                <p className="font-semibold">{paymentStatus}</p>
              </div>
            </div>
            {payment.payment_url && (
              <a
                href={payment.payment_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-primary font-medium"
              >
                <ExternalLink size={16} /> Open payment link
              </a>
            )}
          </div>
        )}

        {order.review && (
          <div className="card p-6 mb-4">
            <h3 className="font-semibold mb-3">Your Review</h3>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  className={
                    index < order.review.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            {order.review.comment && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {order.review.comment}
              </p>
            )}
            {order.review.response && (
              <div className="pl-3 border-l-2 border-primary/30 bg-primary-50/50 dark:bg-primary-900/10 rounded-r-[8px] p-3 mt-2">
                <p className="text-xs font-medium text-primary mb-1">
                  Master's response
                </p>
                <p className="text-sm text-gray-500">{order.review.response}</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          {payment &&
            order.status === "accepted" &&
            payment.status === "pending" && (
              <button
                onClick={() => router.push(`/payment/${orderId}`)}
                className="btn-primary w-full"
              >
                Pay Now
              </button>
            )}

          {order.status === "completed" && !order.is_paid && (
            <button
              onClick={handleConfirmCompletion}
              className="btn-primary w-full"
            >
              Confirm Completion
            </button>
          )}

          {order.status === "completed" && order.is_paid && !order.is_rated && (
            <button
              onClick={() => router.push(`/orders/${orderId}/review`)}
              className="btn-primary w-full"
            >
              Leave Review
            </button>
          )}

          {payment && ["held", "completed"].includes(payment.status) && (
            <button
              onClick={() => router.push(`/dispute/${payment.id}`)}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <ShieldAlert size={16} /> Open Dispute
            </button>
          )}

          {["pending", "looking_master", "offered", "accepted"].includes(
            order.status,
          ) && (
            <button
              onClick={handleCancel}
              className="btn-ghost w-full text-danger mt-2"
            >
              Cancel Order
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
