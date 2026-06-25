"use client";

import { useEffect, useState } from "react";
import { Save, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings/").then(res => setSettings(res.data)).catch(() => toast.error("Yuklashda xatolik"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      for (const [key, field] of Object.entries(settings as Record<string, any>)) {
        payload[key] = field.type === "int" ? Number(field.value) : field.value;
      }
      await api.patch("/settings/", payload);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const setValue = (key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      <header className="bg-white dark:bg-dark-50 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <Button onClick={handleSave} loading={saving} icon={<Save size={16} />}>
          Save Changes
        </Button>
      </header>
      <main className="p-6 max-w-3xl">
        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
        ) : settings ? (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Commission & Pricing</h3>
              <div className="space-y-4">
                <Input label="Platform Commission (%)" type="number" value={settings.PLATFORM_COMMISSION.value}
                  onChange={e => setValue("PLATFORM_COMMISSION", e.target.value)} />
                <Input label="Minimum Withdrawal (UZS)" type="number" value={settings.MINIMUM_WITHDRAWAL.value}
                  onChange={e => setValue("MINIMUM_WITHDRAWAL", e.target.value)} />
                <Input label="Maximum Withdrawal (UZS)" type="number" value={settings.MAXIMUM_WITHDRAWAL.value}
                  onChange={e => setValue("MAXIMUM_WITHDRAWAL", e.target.value)} />
                <Input label="New User Bonus (UZS)" type="number" value={settings.NEW_USER_BONUS.value}
                  onChange={e => setValue("NEW_USER_BONUS", e.target.value)} />
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold mb-4">System</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="font-medium">Maintenance Mode</span>
                  <input type="checkbox" className="toggle" checked={settings.MAINTENANCE_MODE.value}
                    onChange={e => setValue("MAINTENANCE_MODE", e.target.checked)} />
                </label>
                <label className="flex items-center justify-between">
                  <span className="font-medium">Require Master Verification</span>
                  <input type="checkbox" className="toggle" checked={settings.MASTER_VERIFICATION_REQUIRED.value}
                    onChange={e => setValue("MASTER_VERIFICATION_REQUIRED", e.target.checked)} />
                </label>
                <Input label="Free Orders Per Day" type="number" value={settings.FREE_ORDERS_PER_DAY.value}
                  onChange={e => setValue("FREE_ORDERS_PER_DAY", e.target.value)} />
                <Input label="Order Cancellation Time (minutes)" type="number" value={settings.ORDER_CANCELLATION_TIME.value}
                  onChange={e => setValue("ORDER_CANCELLATION_TIME", e.target.value)} />
                <Input label="Emergency Contact" value={settings.EMERGENCY_CONTACT.value}
                  onChange={e => setValue("EMERGENCY_CONTACT", e.target.value)} />
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Cache & Performance</h3>
              <div className="flex gap-3">
                <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={() => toast.success("Cache cleared")}>
                  Clear Cache
                </Button>
                <Button variant="secondary" icon={<Search size={16} />} onClick={() => toast.success("Search reindexed")}>
                  Reindex Search
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Failed to load settings</p>
        )}
      </main>
    </div>
  );
}
