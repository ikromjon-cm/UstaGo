"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle, XCircle, Plus, Trash2 } from "lucide-react";
import { schedulesAPI } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ListSkeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ date: "", start_time: "", end_time: "" });

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const load = useCallback(() => {
    setLoading(true);
    schedulesAPI.get()
      .then(res => setSchedules(res.data.results || res.data))
      .catch(() => toast.error("Yuklashda xatolik"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const weekSchedules = schedules.filter((s: any) => {
    const d = new Date(s.date);
    return d >= currentWeekStart && d <= weekEnd;
  });

  const getForDate = (date: string) => weekSchedules.find((s: any) => s.date === date);

  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const handleSave = async () => {
    if (!form.date) { toast.error("Date required"); return; }
    try {
      const payload = { ...form };
      if (editing) {
        await schedulesAPI.update(editing.id, payload);
        toast.success("Updated");
      } else {
        await schedulesAPI.create(payload);
        toast.success("Created");
      }
      setShowModal(false);
      setEditing(null);
      setForm({ date: "", start_time: "", end_time: "" });
      load();
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await schedulesAPI.delete(id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ date: s.date, start_time: s.start_time || "", end_time: s.end_time || "" });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Schedule</h1>
          <Button icon={<Plus size={16} />} onClick={() => { setEditing(null); setForm({ date: "", start_time: "", end_time: "" }); setShowModal(true); }}>
            Add Slot
          </Button>
        </div>

        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevWeek} className="btn-ghost p-2"><ChevronLeft size={20} /></button>
            <span className="font-semibold">
              {currentWeekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
            </span>
            <button onClick={nextWeek} className="btn-ghost p-2"><ChevronRight size={20} /></button>
          </div>

          {loading ? (
            <ListSkeleton count={3} />
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map(date => {
                const slot = getForDate(date);
                const dayName = weekDays[new Date(date).getDay()];
                const isToday = new Date(date).toDateString() === new Date().toDateString();
                return (
                  <div key={date} className={`p-3 rounded-[12px] text-center border transition-all ${
                    isToday ? "border-primary bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700"
                  }`}>
                    <p className="text-xs text-gray-500 mb-1">{dayName}</p>
                    <p className={`text-lg font-bold mb-2 ${isToday ? "text-primary" : ""}`}>
                      {new Date(date).getDate()}
                    </p>
                    {slot ? (
                      <div className="space-y-1">
                        {slot.is_available ? (
                          <div className="flex items-center justify-center gap-1 text-green-600 text-xs">
                            <CheckCircle size={12} /> Available
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 text-red-500 text-xs">
                            <XCircle size={12} /> Off
                          </div>
                        )}
                        {slot.start_time && (
                          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                            <Clock size={10} /> {slot.start_time.slice(0, 5)}-{slot.end_time?.slice(0, 5)}
                          </p>
                        )}
                        <button onClick={() => openEdit(slot)} className="text-xs text-primary hover:underline mt-1">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(slot.id)} className="text-xs text-red-500 hover:underline ml-2">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditing(null); setForm({ date, start_time: "09:00", end_time: "18:00" }); setShowModal(true); }}
                        className="text-xs text-gray-400 hover:text-primary"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Slot" : "New Slot"}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Time</label>
                <input type="time" className="input" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Time</label>
                <input type="time" className="input" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
          </div>
        </Modal>
      </main>
    </div>
  );
}
