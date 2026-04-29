/**
 * 后台仪表盘布局 —— 带侧边栏的内部 Layout
 *
 * 使用 Route Group (dashboard) 让登录页不包含侧边栏，
 * 只有登录后的管理页面才展示 Sidebar + 右侧内容区
 */
import Sidebar from "../_components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-60 p-8 min-h-screen">{children}</main>
    </div>
  );
}
