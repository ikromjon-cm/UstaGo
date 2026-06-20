"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/api";
import toast from "react-hot-toast";

export default function OTPVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) { const t = setTimeout(() => setTimer(t => t - 1), 1000); return () => clearTimeout(t); }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) { toast.error("6 xonali kodni kiriting"); return; }
    setLoading(true);
    try {
      const res = await authAPI.verifyOtp(phone, code);
      toast.success("Tasdiqlandi!");
      router.push(res.data.registered ? "/login" : "/");
    } catch { toast.error("Notog'ri kod"); } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      await authAPI.sendOtp(phone);
      setTimer(60);
      toast.success("Kod qayta yuborildi");
    } catch { toast.error("Xatolik yuz berdi"); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-[20px] flex items-center justify-center mx-auto">
          <span className="text-3xl font-bold text-primary">📱</span>
        </div>
        <h1 className="text-2xl font-bold">Kodni tasdiqlang</h1>
        <p className="text-gray-500">{phone} raqamiga 6 xonali kod yuborildi</p>
        <div className="flex gap-2 justify-center">
          {otp.map((digit, i) => (
            <input key={i} ref={el => { refs.current[i] = el; }}
              className="w-12 h-14 text-center text-xl font-bold input rounded-[12px]"
              value={digit} onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => { if (e.key === "Backspace" && !digit && i > 0) refs.current[i - 1]?.focus(); }}
              maxLength={1} inputMode="numeric" autoFocus={i === 0} />
          ))}
        </div>
        <button onClick={handleVerify} className="btn-primary w-full" disabled={loading}>
          {loading ? "Tekshirilmoqda..." : "Tasdiqlash"}
        </button>
        <div className="text-sm text-gray-500">
          {timer > 0 ? (
            <span>Kodni qayta yuborish: {timer}s</span>
          ) : (
            <button onClick={handleResend} className="text-primary font-medium">Kodni qayta yuborish</button>
          )}
        </div>
      </div>
    </div>
  );
}
