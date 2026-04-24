/**
 * IR 联系表单组件 —— 投资者通过此表单提交咨询
 */
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function IRContactForm() {
  const t = useTranslations("IRContacts");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/ir-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", company: "", phone: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none transition";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-2 dark:text-slate-300">
          {t("name")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder={t("namePlaceholder")}
          className={inputClass}
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
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder={t("emailPlaceholder")}
          className={inputClass}
        />
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-medium mb-2 dark:text-slate-300">
          {t("company")}
        </label>
        <input
          type="text"
          value={form.company}
          onChange={(e) => update("company", e.target.value)}
          placeholder={t("companyPlaceholder")}
          className={inputClass}
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium mb-2 dark:text-slate-300">
          {t("phone")}
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder={t("phonePlaceholder")}
          className={inputClass}
        />
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium mb-2 dark:text-slate-300">
          {t("subject")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          placeholder={t("subjectPlaceholder")}
          className={inputClass}
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium mb-2 dark:text-slate-300">
          {t("message")} <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder={t("messagePlaceholder")}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
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
