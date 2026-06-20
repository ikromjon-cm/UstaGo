"use client";

import { useState } from "react";
import { Plus, Grid3X3, List, Trash2 } from "lucide-react";

export default function MasterPortfolioPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [items, setItems] = useState<any[]>([
    { id: 1, title: "Kitchen Renovation", image: null, category: "Renovation" },
    { id: 2, title: "Bathroom Tiling", image: null, category: "Tiling" },
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-dark-50 rounded-[10px] p-1">
            <button onClick={() => setView("grid")} className={`p-2 rounded-[8px] ${view === "grid" ? "bg-white dark:bg-dark shadow-sm" : ""}`}><Grid3X3 size={18} /></button>
            <button onClick={() => setView("list")} className={`p-2 rounded-[8px] ${view === "list" ? "bg-white dark:bg-dark shadow-sm" : ""}`}><List size={18} /></button>
          </div>
          <button className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Photo</button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-[20px] bg-gray-100 dark:bg-dark-50 flex items-center justify-center mx-auto mb-4">
            <Plus size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No portfolio items</h2>
          <p className="text-gray-500 mb-6">Showcase your work to attract more customers</p>
          <button className="btn-primary">Add Your First Photo</button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="card overflow-hidden group relative">
              <div className="aspect-square bg-gray-100 dark:bg-dark-50 flex items-center justify-center">
                <span className="text-gray-400">Photo</span>
              </div>
              <div className="p-3">
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-gray-500">{item.category}</p>
              </div>
              <button className="absolute top-2 right-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} className="text-danger" /></button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="card flex items-center gap-4 p-4">
              <div className="w-16 h-16 rounded-[12px] bg-gray-100 dark:bg-dark-50 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-400 text-xs">Photo</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">{item.category}</p>
              </div>
              <button className="btn-ghost p-2"><Trash2 size={18} className="text-danger" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
