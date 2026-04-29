/** 日期格式化组件 —— 根据当前 locale 显示本地化日期（使用 date-fns） */
"use client";

import { parseISO, format } from "date-fns";
import { type Locale as DateLocale, enUS, nl, it } from "date-fns/locale";
import { useLocale } from "next-intl";

const localeMap: Record<string, DateLocale> = {
  en: enUS,
  nl: nl,
  it: it,
};

type Props = {
  dateString: string;
};

const DateFormatter = ({ dateString }: Props) => {
  const locale = useLocale();
  const date = parseISO(dateString);

  return (
    <time dateTime={dateString}>
      {format(date, "LLLL d, yyyy", { locale: localeMap[locale] || enUS })}
    </time>
  );
};

export default DateFormatter;
