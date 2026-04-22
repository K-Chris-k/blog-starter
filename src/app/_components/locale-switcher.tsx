"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

const localeLabels: Record<string, string> = {
  en: "EN",
  nl: "NL",
  it: "IT",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex gap-2">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          className={`px-2 py-1 text-sm rounded transition-colors ${
            locale === loc
              ? "bg-black text-white dark:bg-white dark:text-black font-bold"
              : "text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
