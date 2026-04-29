/**
 * 投资者联系管理页 —— /ir-dashboard/contacts
 *
 * 展示 ir_contact_messages 表数据，支持按状态筛选（新消息/已读/已回复/已关闭）
 */
"use client";

import DataTable from "../../_components/data-table";

export default function ContactsPage() {
  return (
    <DataTable
      table="ir_contact_messages"
      title="投资者联系"
      filters={[
        {
          key: "status",
          label: "状态",
          options: [
            { value: "new", label: "新消息" },
            { value: "read", label: "已读" },
            { value: "replied", label: "已回复" },
            { value: "closed", label: "已关闭" },
          ],
        },
      ]}
    />
  );
}
