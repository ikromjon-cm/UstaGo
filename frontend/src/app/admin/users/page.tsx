"use client";

import { useEffect, useState } from "react";
import { UserCheck, UserX, Shield, ShieldOff } from "lucide-react";
import { authAPI } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmUser, setConfirmUser] = useState<any | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    "block" | "unblock" | null
  >(null);

  const loadUsers = () => {
    setLoading(true);
    authAPI
      .getUsers()
      .then((res) => setUsers(res.data.results || res.data))
      .catch(() => toast.error("Yuklashda xatolik"))
      .finally(() => setLoading(false));
  };

  useEffect(loadUsers, []);

  const handleBlock = async (user: any) => {
    try {
      await authAPI.updateUser(user.id, { status: "banned" });
      toast.success(`${user.full_name} blocked`);
      loadUsers();
    } catch {
      toast.error("Failed to block user");
    }
  };

  const handleUnblock = async (user: any) => {
    try {
      await authAPI.updateUser(user.id, { status: "active" });
      toast.success(`${user.full_name} unblocked`);
      loadUsers();
    } catch {
      toast.error("Failed to unblock user");
    }
  };

  const columns = [
    {
      key: "full_name",
      label: "User",
      sortable: true,
      render: (u: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
            {u.full_name?.charAt(0)}
          </div>
          <span className="font-medium">{u.full_name}</span>
        </div>
      ),
    },
    { key: "phone", label: "Phone", sortable: true },
    {
      key: "role",
      label: "Role",
      render: (u: any) => (
        <span className="badge-primary capitalize">{u.role}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (u: any) => (
        <span
          className={u.status === "active" ? "badge-success" : "badge-danger"}
        >
          {u.status}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Joined",
      sortable: true,
      render: (u: any) => new Date(u.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (u: any) => (
        <div className="flex gap-2">
          {u.status === "active" ? (
            <Button
              variant="ghost"
              size="sm"
              icon={<UserX size={14} />}
              onClick={() => {
                setConfirmUser(u);
                setConfirmAction("block");
              }}
              className="text-red-500 hover:text-red-700"
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              icon={<UserCheck size={14} />}
              onClick={() => {
                setConfirmUser(u);
                setConfirmAction("unblock");
              }}
              className="text-green-500 hover:text-green-700"
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold">User Management</h1>
      </header>
      <main className="p-6">
        {loading ? (
          <TableSkeleton rows={6} />
        ) : (
          <DataTable
            columns={columns}
            data={users}
            loading={false}
            searchable
            emptyMessage="No users found"
          />
        )}
      </main>

      {confirmUser && confirmAction && (
        <ConfirmDialog
          open
          onClose={() => {
            setConfirmUser(null);
            setConfirmAction(null);
          }}
          onConfirm={() =>
            confirmAction === "block"
              ? handleBlock(confirmUser)
              : handleUnblock(confirmUser)
          }
          title={confirmAction === "block" ? "Block User" : "Unblock User"}
          message={`Are you sure you want to ${confirmAction} ${confirmUser.full_name}?`}
          confirmText={confirmAction === "block" ? "Block" : "Unblock"}
          variant={confirmAction === "block" ? "danger" : "primary"}
        />
      )}
    </div>
  );
}
