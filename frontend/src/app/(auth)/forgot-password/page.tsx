"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { authAPI } from "@/lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp" | "reset">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      const res = await authAPI.sendOtp(phone);
      const otpCode = res.data.otp || "";
      setDevOtp(otpCode);
      if (otpCode) localStorage.setItem("dev_otp", otpCode);
      toast.success("OTP sent to your phone");
      setStep("otp");
    } catch { toast.error("Failed to send OTP"); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      await authAPI.verifyOtp(phone, otp);
      toast.success("Verified");
      setStep("reset");
    } catch { toast.error("Invalid OTP"); }
    finally { setLoading(false); }
  };

  const handleReset = async () => {
    if (password.length < 6) return;
    setLoading(true);
    try {
      await authAPI.resetPassword(phone, otp, password);
      toast.success("Password reset successfully");
      router.push("/login");
    } catch { toast.error("Failed to reset password"); }
    finally { setLoading(false); }
  };

  return (
    <div className="card p-8">
      <button onClick={() => router.back()} className="btn-ghost p-2 mb-4"><ArrowLeft size={20} /></button>
      <h2 className="text-2xl font-bold mb-2">
        {step === "phone" ? "Forgot Password" : step === "otp" ? "Enter OTP" : "New Password"}
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        {step === "phone" ? "Enter your phone number to receive a reset code" :
         step === "otp" ? "Enter the code sent to your phone" : "Enter your new password"}
      </p>

      {step === "phone" && (
        <div className="space-y-4">
          <input className="input" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
          <button onClick={handleSendOtp} disabled={loading || !phone} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? "Sending..." : <>Send OTP <Send size={16} /></>}
          </button>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-4">
          {devOtp && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 text-center text-lg font-bold py-2 px-4 rounded-lg">
              DEV: {devOtp}
            </div>
          )}
          <input className="input" placeholder="Enter OTP code" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} />
          <button onClick={handleVerifyOtp} disabled={loading || otp.length < 4} className="btn-primary w-full">
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      )}

      {step === "reset" && (
        <div className="space-y-4">
          <input className="input" type="password" placeholder="New password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={handleReset} disabled={loading || password.length < 6} className="btn-primary w-full">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      )}
    </div>
  );
}
