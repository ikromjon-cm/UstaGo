"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  MessageCircle,
  Send,
  Star,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { chatAPI, mastersAPI, ordersAPI, walletAPI } from "@/lib/api";
import { MasterProfile, Order, Wallet as WalletType } from "@/types";

type DashboardTab = "marketplace" | "assigned" | "history";

const OPEN_STATUSES = ["pending", "looking_master", "offered"];
const ASSIGNED_STATUSES = ["accepted", "in_progress"];
const HISTORY_STATUSES = ["completed", "cancelled"];

export default function MasterDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MasterProfile | null>(null);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<DashboardTab>("marketplace");
  const [offerOrder, setOfferOrder] = useState<Order | null>(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDuration, setOfferDuration] = useState("60");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);

  const refreshDashboard = async () => {
    setLoading(true);
    try {
      const [profileRes, ordersRes, walletRes] = await Promise.all([
        mastersAPI.getMe(),
        ordersAPI.getAll(),
        walletAPI.getBalance(),
      ]);

      const orderResults = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : ordersRes.data?.results || [];

      setProfile(profileRes.data);
      setOrders(orderResults);
      setWallet(walletRes.data);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  const currentMasterUserId = profile?.user?.id;

  const marketplaceOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          OPEN_STATUSES.includes(order.status) &&
          order.master_detail?.user?.id !== currentMasterUserId,
      ),
    [orders, currentMasterUserId],
  );

  const assignedOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.master_detail?.user?.id === currentMasterUserId &&
          ASSIGNED_STATUSES.includes(order.status),
      ),
    [orders, currentMasterUserId],
  );

  const historyOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.master_detail?.user?.id === currentMasterUserId &&
          HISTORY_STATUSES.includes(order.status),
      ),
    [orders, currentMasterUserId],
  );

  const stats = useMemo(
    () => ({
      openOrders: marketplaceOrders.length,
      activeJobs: assignedOrders.length,
      completedJobs:
        historyOrders.filter((order) => order.status === "completed").length ||
        profile?.completed_jobs ||
        0,
      rating: Number(profile?.rating || 0),
      availableBalance: Number(wallet?.balance || 0),
    }),
    [
      assignedOrders.length,
      historyOrders,
      marketplaceOrders.length,
      profile,
      wallet,
    ],
  );

  const openOfferModal = (order: Order) => {
    setOfferOrder(order);
    setOfferPrice(String(Number(order.final_price || order.budget || 0) || ""));
    setOfferDuration("60");
    setOfferDescription("");
  };

  const closeOfferModal = () => {
    if (offerSubmitting) return;
    setOfferOrder(null);
    setOfferPrice("");
    setOfferDuration("60");
    setOfferDescription("");
  };

  const submitOffer = async () => {
    if (!offerOrder) return;

    const price = Number(offerPrice);
    const duration = Number(offerDuration);

    if (!price || price <= 0) {
      toast.error("Enter a valid offer price");
      return;
    }
    if (!duration || duration <= 0) {
      toast.error("Enter a valid duration");
      return;
    }

    setOfferSubmitting(true);
    try {
      await ordersAPI.makeOffer(offerOrder.id, {
        price,
        estimated_duration: duration,
        description: offerDescription,
      });
      toast.success("Offer sent successfully");
      closeOfferModal();
      await refreshDashboard();
      setTab("assigned");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to send offer");
    } finally {
      setOfferSubmitting(false);
    }
  };

  const handleOrderAction = async (
    orderId: string,
    action: "start" | "complete",
  ) => {
    setActionOrderId(orderId);
    try {
      if (action === "start") {
        await ordersAPI.startWork(orderId);
        toast.success("Work started");
      } else {
        await ordersAPI.completeWork(orderId);
        toast.success("Work marked as completed");
      }
      await refreshDashboard();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Action failed");
    } finally {
      setActionOrderId(null);
    }
  };

  const handleChat = async (order: Order) => {
    try {
      const response = await chatAPI.getOrCreate(
        order.customer_detail.id,
        order.id,
      );
      router.push(`/chat/${response.data.id}`);
    } catch {
      toast.error("Failed to open chat");
    }
  };

  const formatMoney = (value: number) =>
    `${Number(value || 0).toLocaleString()} UZS`;

  const formatDate = (value?: string) => {
    if (!value) return "Flexible";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  };

  const orderAmount = (order: Order) =>
    Number(order.final_price || order.budget || 0);

  const statusClass = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300";
      case "in_progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
      case "completed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const cards = [
    {
      label: "Open Opportunities",
      value: stats.openOrders,
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Active Jobs",
      value: stats.activeJobs,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Completed",
      value: stats.completedJobs,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Available Balance",
      value: formatMoney(stats.availableBalance),
      icon: Wallet,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
  ];

  const renderOrderCard = (
    order: Order,
    mode: "marketplace" | "assigned" | "history",
  ) => (
    <div key={order.id} className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-semibold text-lg">{order.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {order.description || "No description provided"}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusClass(order.status)}`}
            >
              {order.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="grid gap-2 text-sm text-gray-500 sm:grid-cols-2 lg:grid-cols-4">
            <span className="flex items-center gap-1">
              <DollarSign size={14} /> {formatMoney(orderAmount(order))}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {formatDate(order.preferred_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} /> {order.urgency}
            </span>
            <span className="flex items-center gap-1">
              <Star size={14} /> {Number(profile?.rating || 0).toFixed(1)}{" "}
              rating
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-3">{order.address}</p>
        </div>

        <div className="flex flex-wrap gap-2 lg:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/orders/${order.id}`)}
          >
            View
          </Button>

          {mode === "marketplace" && (
            <Button
              size="sm"
              onClick={() => openOfferModal(order)}
              icon={<Send size={14} />}
            >
              Send Offer
            </Button>
          )}

          {mode === "assigned" && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleChat(order)}
                icon={<MessageCircle size={14} />}
              >
                Chat
              </Button>
              {order.status === "accepted" ? (
                <Button
                  size="sm"
                  variant="success"
                  loading={actionOrderId === order.id}
                  onClick={() => handleOrderAction(order.id, "start")}
                >
                  Start Work
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="success"
                  loading={actionOrderId === order.id}
                  onClick={() => handleOrderAction(order.id, "complete")}
                >
                  Complete Work
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Master Dashboard</h1>
            <p className="text-gray-500">
              {profile?.user?.full_name || "Master"} • Rating{" "}
              {Number(profile?.rating || 0).toFixed(1)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/earnings")}>
              Earnings
            </Button>
            <Button variant="outline" onClick={() => refreshDashboard()}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <div key={card.label} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-[12px] ${card.bg} flex items-center justify-center`}
                >
                  <card.icon size={20} className={card.color} />
                </div>
              </div>
              <p className="text-2xl font-bold mb-0.5">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          {(
            [
              ["marketplace", `Marketplace (${marketplaceOrders.length})`],
              ["assigned", `Assigned (${assignedOrders.length})`],
              ["history", `History (${historyOrders.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-[12px] text-sm font-medium transition-all ${
                tab === key
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "marketplace" &&
          (marketplaceOrders.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={28} />}
              title="No new orders right now"
              description="Pull fresh data or check back shortly for new nearby requests."
              action={{ label: "Refresh", onClick: refreshDashboard }}
            />
          ) : (
            <div className="space-y-3">
              {marketplaceOrders.map((order) =>
                renderOrderCard(order, "marketplace"),
              )}
            </div>
          ))}

        {tab === "assigned" &&
          (assignedOrders.length === 0 ? (
            <EmptyState
              icon={<Clock size={28} />}
              title="No active jobs"
              description="Accepted and in-progress orders will appear here."
            />
          ) : (
            <div className="space-y-3">
              {assignedOrders.map((order) =>
                renderOrderCard(order, "assigned"),
              )}
            </div>
          ))}

        {tab === "history" &&
          (historyOrders.length === 0 ? (
            <EmptyState
              icon={<CheckCircle size={28} />}
              title="No order history yet"
              description="Completed and cancelled jobs will appear here once you start taking orders."
            />
          ) : (
            <div className="space-y-3">
              {historyOrders.map((order) => renderOrderCard(order, "history"))}
            </div>
          ))}
      </main>

      <Modal
        open={Boolean(offerOrder)}
        onClose={closeOfferModal}
        title={offerOrder ? `Send offer for ${offerOrder.title}` : "Send offer"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Your price (UZS)"
            type="number"
            min={0}
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
          />
          <Input
            label="Estimated duration (minutes)"
            type="number"
            min={1}
            value={offerDuration}
            onChange={(e) => setOfferDuration(e.target.value)}
          />
          <Textarea
            label="Message to customer"
            rows={4}
            placeholder="Describe your plan, arrival time, or any details that help the customer choose you."
            value={offerDescription}
            onChange={(e) => setOfferDescription(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={closeOfferModal}
              disabled={offerSubmitting}
            >
              Cancel
            </Button>
            <Button
              loading={offerSubmitting}
              onClick={submitOffer}
              icon={<Send size={16} />}
            >
              Send Offer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
