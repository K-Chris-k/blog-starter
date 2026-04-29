/**
 * 邮件订阅管理页 —— /ir-dashboard/subscriptions
 *
 * 展示 email_subscriptions 表数据，支持按活跃/已退订状态筛选
 */
"use client";

import DataTable from "../../_components/data-table";

export default function SubscriptionsPage() {
  return (
    <DataTable
      table="email_subscriptions"
      title="邮件订阅"
      filters={[
        {
          key: "is_active",
          label: "状态",
          options: [
            { value: "1", label: "活跃" },
            { value: "0", label: "已退订" },
          ],
        },
      ]}
    />
  );
}
