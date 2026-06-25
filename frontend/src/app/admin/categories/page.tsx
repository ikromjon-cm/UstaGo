"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, ChevronRight } from "lucide-react";
import { categoriesAPI } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { TableSkeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ title_uz: "", title_ru: "", title_en: "", description: "" });

  const load = () => {
    setLoading(true);
    categoriesAPI.getAll()
      .then(res => setCategories(res.data.results || res.data))
      .catch(() => toast.error("Yuklashda xatolik"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async () => {
    if (!form.title_uz) { toast.error("Title required"); return; }
    try {
      if (editing) {
        await categoriesAPI.update(editing.id, form);
        toast.success("Category updated");
      } else {
        await categoriesAPI.create(form);
        toast.success("Category created");
      }
      setShowModal(false);
      setEditing(null);
      setForm({ title_uz: "", title_ru: "", title_en: "", description: "" });
      load();
    } catch {
      toast.error("Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await categoriesAPI.delete(id);
      toast.success("Category deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (cat: any) => {
    setEditing(cat);
    setForm({ title_uz: cat.title_uz, title_ru: cat.title_ru || "", title_en: cat.title_en || "", description: cat.description || "" });
    setShowModal(true);
  };

  const columns = [
    { key: "title_uz", label: "Title (UZ)", sortable: true },
    { key: "title_ru", label: "Title (RU)", sortable: true },
    { key: "title_en", label: "Title (EN)", sortable: true },
    {
      key: "is_active",
      label: "Status",
      render: (c: any) => (
        <span className={c.is_active ? "badge-success" : "badge-danger"}>
          {c.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "sort_order",
      label: "Order",
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      render: (c: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon={<Edit2 size={14} />} onClick={() => openEdit(c)} />
          <Button variant="ghost" size="sm" icon={<Trash2 size={14} className="text-red-500" />} onClick={() => handleDelete(c.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button icon={<Plus size={16} />} onClick={() => { setEditing(null); setForm({ title_uz: "", title_ru: "", title_en: "", description: "" }); setShowModal(true); }}>
          Add Category
        </Button>
      </header>
      <main className="p-6">
        {loading ? <TableSkeleton rows={5} /> : (
          <DataTable
            columns={columns}
            data={categories}
            loading={false}
            searchable
            emptyMessage="No categories yet. Add your first category!"
          />
        )}
      </main>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Category" : "New Category"}>
        <div className="space-y-4">
          <Input label="Title (Uzbek) *" value={form.title_uz} onChange={e => setForm(f => ({ ...f, title_uz: e.target.value }))} />
          <Input label="Title (Russian)" value={form.title_ru} onChange={e => setForm(f => ({ ...f, title_ru: e.target.value }))} />
          <Input label="Title (English)" value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} />
          <Textarea label="Description" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <Button onClick={handleSave} className="w-full">
            {editing ? "Update" : "Create"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
