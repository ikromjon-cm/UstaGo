"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2 } from "lucide-react";

export default function CallPage() {
  const { id } = useParams();
  const router = useRouter();
  const [muted, setMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [duration, setDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(true);

  useEffect(() => {
    if (!isCallActive) return;
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [isCallActive]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const endCall = () => {
    setIsCallActive(false);
    router.back();
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-white">
        <div className="w-24 h-24 rounded-full bg-primary/30 flex items-center justify-center mb-4">
          <span className="text-4xl font-bold text-white">U</span>
        </div>
        <h2 className="text-xl font-bold">Master</h2>
        <p className="text-gray-400">Santexnik</p>
        <p className="text-2xl font-mono mt-4">{formatTime(duration)}</p>
      </div>

      <div className="p-8 flex justify-center gap-6">
        <button onClick={() => setMuted(!muted)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${muted ? 'bg-danger text-white' : 'bg-white/20 text-white'}`}>
          {muted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button onClick={endCall}
          className="w-16 h-16 rounded-full bg-danger flex items-center justify-center text-white">
          <PhoneOff size={24} />
        </button>
        <button onClick={() => setVideoEnabled(!videoEnabled)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${!videoEnabled ? 'bg-danger text-white' : 'bg-white/20 text-white'}`}>
          {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
      </div>
    </div>
  );
}
