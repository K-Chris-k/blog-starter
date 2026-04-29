/**
 * 后台认证守卫组件 —— 保护所有 ir-dashboard 页面
 *
 * 工作流程：
 *   1. 页面加载时调用 /api/ir-dashboard/session 检查登录状态
 *   2. 未登录 → 自动跳转到 /ir-dashboard/login
 *   3. 已登录 → 通过 AdminContext 向子组件提供 user 信息和 logout 方法
 *   4. 登录页本身不需要认证，直接放行
 */
"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AdminUser {
  id: number;
  username: string;
  role: string;
}

const AdminContext = createContext<{
  user: AdminUser | null;
  logout: () => void;
}>({ user: null, logout: () => {} });

export const useAdmin = () => useContext(AdminContext);

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === "/ir-dashboard/login") {
      setChecking(false);
      return;
    }

    fetch("/api/ir-dashboard/session")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setUser(data.user);
        setChecking(false);
      })
      .catch(() => {
        router.push("/ir-dashboard/login");
      });
  }, [pathname, router]);

  const logout = async () => {
    await fetch("/api/ir-dashboard/logout", { method: "POST" });
    router.push("/ir-dashboard/login");
  };

  if (pathname === "/ir-dashboard/login") {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full" />
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ user, logout }}>
      {children}
    </AdminContext.Provider>
  );
}
