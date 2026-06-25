"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { categoriesAPI, servicesAPI } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { TableSkeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [filterCat, setFilterCat] = useState("");
  const [form, setForm] = useState({
    category: "", title_uz: "", title_ru: "", title_en: "",
    description: "", price_from: "", price_to: "", duration_minutes: "60", sort_order: "0",
  });

  const loadCategories = useCallback(() => {
    categoriesAPI.getAll().then(res => setCategories(res.data.results || res.data)).catch(() => toast.error("Yuklashda xatolik"));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    servicesAPI.getAll(filterCat || undefined)
      .then(res => setServices(res.data.results || res.data))
      .catch(() => toast.error("Yuklashda xatolik"))
      .finally(() => setLoading(false));
  }, [filterCat]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.title_uz || !form.category) { toast.error("Title and category required"); return; }
    try {
      const payload = { ...form, price_from: Number(form.price_from), price_to: Number(form.price_to), duration_minutes: Number(form.duration_minutes), sort_order: Number(form.sort_order) };
      if (editing) {
        await servicesAPI.update(editing.id, payload);
        toast.success("Service updated");
      } else {
        await servicesAPI.create(payload);
        toast.success("Service created");
      }
      setShowModal(false);
      setEditing(null);
      setForm({ category: "", title_uz: "", title_ru: "", title_en: "", description: "", price_from: "", price_to: "", duration_minutes: "60", sort_order: "0" });
      load();
    } catch {
      toast.error("Failed to save service");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      await servicesAPI.delete(id);
      toast.success("Service deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      category: s.category, title_uz: s.title_uz, title_ru: s.title_ru || "",
      title_en: s.title_en || "", description: s.description || "",
      price_from: String(s.price_from), price_to: String(s.price_to),
      duration_minutes: String(s.duration_minutes), sort_order: String(s.sort_order),
    });
    setShowModal(true);
  };

  const columns = [
    { key: "title_uz", label: "Title (UZ)", sortable: true },
    { key: "title_ru", label: "Title (RU)" },
    {
      key: "category", label: "Category",
      render: (s: any) => categories.find(c => c.id === s.category)?.title_uz || s.category,
    },
    {
      key: "price_from", label: "Price",
      render: (s: any) => `${Number(s.price_from).toLocaleString()} - ${Number(s.price_to).toLocaleString()} UZS`,
    },
    { key: "duration_minutes", label: "Duration", render: (s: any) => `${s.duration_minutes} min` },
    {
      key: "is_active", label: "Status",
      render: (s: any) => <span className={s.is_active ? "badge-success" : "badge-danger"}>{s.is_active ? "Active" : "Inactive"}</span>,
    },
    {
      key: "actions", label: "Actions",
      render: (s: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon={<Edit2 size={14} />} onClick={() => openEdit(s)} />
          <Button variant="ghost" size="sm" icon={<Trash2 size={14} className="text-red-500" />} onClick={() => handleDelete(s.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold shrink-0">Services</h1>
        <select className="input max-w-[200px]" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.title_uz}</option>)}
        </select>
        <Button icon={<Plus size={16} />} onClick={() => { setEditing(null); setForm({ category: filterCat || "", title_uz: "", title_ru: "", title_en: "", description: "", price_from: "", price_to: "", duration_minutes: "60", sort_order: "0" }); setShowModal(true); }}>
          Add Service
        </Button>
      </header>
      <main className="p-6">
        {loading ? <TableSkeleton rows={5} /> : (
          <DataTable columns={columns} data={services} loading={false} searchable emptyMessage="No services yet" />
        )}
      </main>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Service" : "New Service"} size="lg">
        <div className="space-y-4">
          <Select label="Category *" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option value="">Select category...</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.title_uz}</option>)}
          </Select>
          <Input label="Title (Uzbek) *" value={form.title_uz} onChange={e => setForm(f => ({ ...f, title_uz: e.target.value }))} />
          <Input label="Title (Russian)" value={form.title_ru} onChange={e => setForm(f => ({ ...f, title_ru: e.target.value }))} />
          <Input label="Title (English)" value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} />
          <Textarea label="Description" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price from (UZS)" type="number" value={form.price_from} onChange={e => setForm(f => ({ ...f, price_from: e.target.value }))} />
            <Input label="Price to (UZS)" type="number" value={form.price_to} onChange={e => setForm(f => ({ ...f, price_to: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Duration (minutes)" type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} />
            <Input label="Sort order" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
          </div>
          <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
        </div>
      </Modal>
    </div>
  );
}
