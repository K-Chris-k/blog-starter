/**
 * Email Alerts 页面 —— 邮件订阅表单
 */
import Container from "@/app/_components/container";
import { EmailAlertsForm } from "@/app/_components/email-alerts-form";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "EmailAlerts" });
  return { title: t("pageTitle") };
}

export default async function EmailAlertsPage() {
  const t = await getTranslations("EmailAlerts");

  return (
    <main>
      <Container>
        <div className="max-w-2xl mx-auto py-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight mb-6 dark:text-slate-200">
            {t("heading")}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10">
            {t("description")}
          </p>
          <EmailAlertsForm />
        </div>
      </Container>
    </main>
  );
}
