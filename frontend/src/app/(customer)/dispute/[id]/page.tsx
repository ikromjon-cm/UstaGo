"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Send, ChevronLeft, Shield } from "lucide-react";
import { paymentsAPI } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Textarea, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import toast from "react-hot-toast";

const reasons = [
  "Master didn't show up",
  "Work not completed as agreed",
  "Quality of work is poor",
  "Overcharged / Wrong price",
  "Damaged property",
  "Other",
];

export default function DisputePage() {
  const { id } = useParams();
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason) { toast.error("Please select a reason"); return; }
    setLoading(true);
    try {
      await paymentsAPI.dispute(id as string, `${reason}: ${details}`);
      setSubmitted(true);
      toast.success("Dispute submitted. We will review it within 24 hours.");
    } catch {
      toast.error("Failed to submit dispute");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="page-container py-6 max-w-lg mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ChevronLeft size={20} /> Back
        </button>

        {submitted ? (
          <div className="card p-8 text-center animate-in">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Dispute Submitted</h2>
            <p className="text-gray-500 mb-6">
              Our support team will review your dispute within 24 hours. You will be notified of the resolution.
            </p>
            <Button onClick={() => router.push("/orders")}>Back to Orders</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Open a Dispute</h1>
              <p className="text-gray-500">Having an issue with this order? We're here to help.</p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-[16px] p-4 flex items-start gap-3 border border-amber-200 dark:border-amber-800/30">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <p className="font-medium mb-1">Before submitting:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Try contacting the master directly via chat</li>
                  <li>Provide as much detail as possible</li>
                  <li>Include photos if applicable</li>
                </ul>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <Select label="Reason for dispute" value={reason} onChange={e => setReason(e.target.value)}>
                <option value="">Select a reason...</option>
                {reasons.map(r => <option key={r} value={r}>{r}</option>)}
              </Select>
              <Textarea
                label="Details"
                placeholder="Describe what happened in detail..."
                rows={5}
                value={details}
                onChange={e => setDetails(e.target.value)}
              />
              <Button onClick={handleSubmit} loading={loading} icon={<Send size={16} />} className="w-full" variant="danger">
                Submit Dispute
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
