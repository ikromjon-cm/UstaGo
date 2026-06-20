"use client";

import { useEffect, useState } from "react";
import { Search, UserCheck, UserX } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/users/")
      .then(res => { setUsers(res.data.results || res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter((u: any) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      <header className="bg-white dark:bg-dark-50 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold">User Management</h1>
      </header>
      <main className="p-6">
        <div className="card p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input className="input pl-12" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left p-4 text-sm font-medium text-gray-500">User</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Phone</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Role</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Joined</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => (
                <tr key={u.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-dark-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[10px] bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary font-bold text-sm">
                        {u.full_name?.charAt(0)}
                      </div>
                      <span className="font-medium">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{u.phone}</td>
                  <td className="p-4"><span className="badge-primary capitalize">{u.role}</span></td>
                  <td className="p-4">
                    <span className={`${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{u.status}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="btn-ghost p-1"><UserCheck size={16} /></button>
                      <button className="btn-ghost p-1 text-danger"><UserX size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
