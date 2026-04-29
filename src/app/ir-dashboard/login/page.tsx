/**
 * 后台登录页 —— /ir-dashboard/login
 *
 * 功能：用户名 + 密码表单，提交到 /api/ir-dashboard/login 验证
 * 登录成功后 JWT Token 存入 HttpOnly Cookie，跳转到仪表盘
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** handleSubmit: 提交登录表单，调用登录 API，成功则跳转仪表盘 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/ir-dashboard/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/ir-dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "登录失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-2">后台管理</h1>
          <p className="text-sm text-gray-500 text-center mb-8">
            Tenways IR 管理系统
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                用户名
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                密码
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                placeholder="********"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {loading ? "登录中..." : "登 录"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
