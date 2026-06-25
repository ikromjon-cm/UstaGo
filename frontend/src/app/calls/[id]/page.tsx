"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Loader2, Wifi, WifiOff } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function CallPage() {
  const { id } = useParams();
  const router = useRouter();
  const [muted, setMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [duration, setDuration] = useState(0);
  const [callState, setCallState] = useState<"connecting" | "ringing" | "connected" | "ended">("connecting");
  const [remoteName, setRemoteName] = useState("Connecting...");

  useWebSocket(`calls/${id}`, (data) => {
    if (data.type === "call_status") {
      setCallState(data.status);
    }
    if (data.type === "user_info" && data.name) {
      setRemoteName(data.name);
    }
  });

  useEffect(() => {
    if (callState !== "connected") return;
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [callState]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const endCall = () => {
    setCallState("ended");
    setTimeout(() => router.back(), 1000);
  };

  const statusIndicator = () => {
    switch (callState) {
      case "connecting": return <><Loader2 size={16} className="animate-spin" /> Connecting...</>;
      case "ringing": return <><Wifi size={16} className="animate-pulse" /> Ringing...</>;
      case "connected": return <><Wifi size={16} /> Connected</>;
      case "ended": return <><WifiOff size={16} /> Call ended</>;
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <div className="px-4 py-3 bg-dark-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {statusIndicator()}
        </div>
        {callState === "connected" && (
          <span className="text-xl font-mono text-white">{formatTime(duration)}</span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-white">
        <div className="w-24 h-24 rounded-full bg-primary/30 flex items-center justify-center mb-4">
          <span className="text-4xl font-bold text-white">U</span>
        </div>
        <h2 className="text-xl font-bold">{remoteName}</h2>
        <p className="text-gray-400">Room: {id?.toString().substring(0, 8)}</p>
      </div>

      {callState !== "ended" && (
        <div className="p-8 flex justify-center gap-6">
          {callState === "connected" && (
            <>
              <button onClick={() => setMuted(!muted)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${muted ? 'bg-danger text-white' : 'bg-white/20 text-white'}`}>
                {muted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <button onClick={() => setVideoEnabled(!videoEnabled)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${!videoEnabled ? 'bg-danger text-white' : 'bg-white/20 text-white'}`}>
                {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
              </button>
            </>
          )}
          <button onClick={endCall}
            className="w-16 h-16 rounded-full bg-danger flex items-center justify-center text-white">
            <PhoneOff size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
