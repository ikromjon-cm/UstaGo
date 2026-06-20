"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/api";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [step, setStep] = useState<"register" | "otp">("register");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.register({ phone, full_name: fullName, password, confirm_password: password, role });
      toast.success("OTP sent to your phone");
      setStep("otp");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.verifyOtp(phone, otp);
      toast.success("Phone verified! Please sign in.");
      router.push("/login");
    } catch (err: any) {
      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md card p-8">
        {step === "register" ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              <p className="text-gray-500">Join UstaGo today</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input className="input" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input type="tel" className="input" placeholder="+998 XX XXX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input type="password" className="input" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">I am a</label>
                <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="customer">Customer</option>
                  <option value="master">Master / Service Provider</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already have an account? <Link href="/login" className="text-primary font-medium">Sign in</Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Verify Phone</h1>
              <p className="text-gray-500">Enter the OTP sent to {phone}</p>
            </div>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input type="text" className="input text-center text-2xl tracking-widest" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required />
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
