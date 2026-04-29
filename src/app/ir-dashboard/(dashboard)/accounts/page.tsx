/**
 * 账户管理页 —— /ir-dashboard/accounts
 *
 * 功能：
 *   - 查看所有管理员账户（用户名、角色、状态、最后登录等）
 *   - admin 角色可以：创建新账户、启用/禁用其他账户
 *   - viewer 角色只能查看，无操作按钮
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "../../_components/admin-guard";

interface Account {
  id: number;
  username: string;
  display_name: string;
  role: string;
  is_active: number;
  last_login_at: string | null;
  last_login_ip: string | null;
  created_at: string;
}

export default function AccountsPage() {
  const { user } = useAdmin();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    displayName: "",
    role: "viewer" as "admin" | "viewer",
  });
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ir-dashboard/data/admin_accounts?limit=50");
      const json = await res.json();
      setAccounts(json.data || []);
      setTotal(json.total || 0);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/ir-dashboard/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ username: "", password: "", displayName: "", role: "viewer" });
        fetchAccounts();
      } else {
        const data = await res.json();
        setError(data.error || "创建失败");
      }
    } catch {
      setError("网络错误");
    }
  };

  const toggleActive = async (id: number, current: number) => {
    await fetch(`/api/ir-dashboard/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: current ? false : true }),
    });
    fetchAccounts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">账户管理</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">共 {total} 个账户</span>
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800"
            >
              {showForm ? "取消" : "+ 新建账户"}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="font-semibold mb-4">新建账户</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">用户名</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">密码</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">显示名称</label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">角色</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="viewer">查看者（只读）</option>
                <option value="admin">管理员（完全权限）</option>
              </select>
            </div>
            {error && (
              <div className="col-span-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                {error}
              </div>
            )}
            <div className="col-span-2">
              <button
                type="submit"
                className="px-5 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800"
              >
                创建账户
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">用户名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">显示名称</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">角色</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">状态</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">最后登录</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">最后 IP</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">创建时间</th>
              {isAdmin && (
                <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    加载中...
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  暂无账户
                </td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr key={acc.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">{acc.id}</td>
                  <td className="px-4 py-3 font-medium">{acc.username}</td>
                  <td className="px-4 py-3">{acc.display_name || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        acc.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {acc.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        acc.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {acc.is_active ? "启用" : "禁用"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {acc.last_login_at
                      ? new Date(acc.last_login_at).toLocaleString("zh-CN")
                      : "从未登录"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {acc.last_login_ip || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(acc.created_at).toLocaleDateString("zh-CN")}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      {acc.id !== user?.id && (
                        <button
                          onClick={() => toggleActive(acc.id, acc.is_active)}
                          className={`text-xs px-3 py-1 rounded ${
                            acc.is_active
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {acc.is_active ? "禁用" : "启用"}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
