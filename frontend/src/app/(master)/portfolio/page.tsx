"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, ImageUp } from "lucide-react";
import { portfolioAPI } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { ListSkeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

export default function PortfolioPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ title: "", description: "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    portfolioAPI.get()
      .then(res => setItems(res.data.results || res.data))
      .catch(() => toast.error("Yuklashda xatolik"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSave = async () => {
    if (!form.title) { toast.error("Title required"); return; }
    if (!editing && !file) { toast.error("Image required"); return; }
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      if (file) fd.append("image", file);
      if (editing) {
        await portfolioAPI.update(editing.id, fd);
        toast.success("Updated");
      } else {
        await portfolioAPI.create(fd);
        toast.success("Created");
      }
      setShowModal(false);
      setEditing(null);
      setForm({ title: "", description: "" });
      setFile(null);
      setPreview(null);
      load();
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await portfolioAPI.delete(id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ title: item.title, description: item.description || "" });
    setFile(null);
    setPreview(item.image || null);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <Button icon={<Plus size={16} />} onClick={() => { setEditing(null); setForm({ title: "", description: "" }); setFile(null); setPreview(null); setShowModal(true); }}>
            Add Photo
          </Button>
        </div>

        {loading ? (
          <ListSkeleton count={4} />
        ) : items.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <ImageUp size={28} className="text-gray-400" />
            </div>
            <h3 className="font-semibold mb-2">No portfolio items yet</h3>
            <p className="text-gray-500 text-sm mb-4 max-w-sm mx-auto">Upload photos of your work to showcase your skills to potential customers</p>
            <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>Add Your First Photo</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item: any) => (
              <div key={item.id} className="card overflow-hidden group relative">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                  {item.image && <Image src={item.image} alt={item.title} width={400} height={400} className="w-full h-full object-cover" unoptimized />}
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  {item.description && <p className="text-xs text-gray-500 truncate">{item.description}</p>}
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button onClick={() => openEdit(item)} className="bg-white/90 dark:bg-gray-800/90 p-1.5 rounded-[8px] text-xs font-medium hover:bg-white">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="bg-red-500/90 p-1.5 rounded-[8px] text-xs text-white font-medium hover:bg-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Item" : "New Portfolio Item"}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Image</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {preview ? (
                <div className="relative">
                  <Image src={preview} alt="Preview" width={400} height={160} className="w-full h-40 object-cover rounded-[12px]" unoptimized />
                  <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-[6px] text-xs">Remove</button>
                </div>
              ) : (
                <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-[12px] p-8 text-center cursor-pointer hover:border-primary transition-colors">
                  <ImageUp size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload image</p>
                </div>
              )}
            </div>
            <Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea label="Description" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
          </div>
        </Modal>
      </main>
    </div>
  );
}
