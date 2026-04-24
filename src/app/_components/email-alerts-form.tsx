/**
 * Email 订阅表单组件 —— 客户端交互组件
 * 收集用户邮箱和订阅类型，提交到 /api/email-subscribe
 */
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const ALERT_TYPE_KEYS = [
  "stock_quote",
  "event",
  "weekly_summary",
  "announcement",
] as const;

const ALERT_TYPE_LABEL_MAP: Record<string, string> = {
  stock_quote: "stockQuote",
  event: "event",
  weekly_summary: "weeklySummary",
  announcement: "announcement",
};

export function EmailAlertsForm() {
  const t = useTranslations("EmailAlerts");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const toggleType = (type: string) => {
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || selected.length === 0) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/email-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined, alertTypes: selected }),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setSelected([]);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-2 dark:text-slate-300">
          {t("name")}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none transition"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-2 dark:text-slate-300">
          {t("email")} <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none transition"
        />
      </div>

      {/* Alert Types */}
      <div>
        <label className="block text-sm font-medium mb-3 dark:text-slate-300">
          {t("alertTypes")} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {ALERT_TYPE_KEYS.map((type) => (
            <label
              key={type}
              className={`flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-all ${
                selected.includes(type)
                  ? "border-black dark:border-white bg-neutral-50 dark:bg-slate-700"
                  : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400"
              }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(type)}
                onChange={() => toggleType(type)}
                className="w-4 h-4 accent-black dark:accent-white"
              />
              <span className="text-sm dark:text-slate-300">
                {t(ALERT_TYPE_LABEL_MAP[type])}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading" || !email || selected.length === 0}
        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === "loading" ? "..." : t("submit")}
      </button>

      {/* Status */}
      {status === "success" && (
        <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
          {t("success")}
        </div>
      )}
      {status === "error" && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {t("error")}
        </div>
      )}
    </form>
  );
}
