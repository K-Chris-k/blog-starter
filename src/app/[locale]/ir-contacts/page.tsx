/**
 * IR Contacts 页面 —— 投资者关系联系页面
 */
import Container from "@/app/_components/container";
import { IRContactForm } from "@/app/_components/ir-contact-form";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "IRContacts" });
  return { title: t("pageTitle") };
}

export default async function IRContactsPage() {
  const t = await getTranslations("IRContacts");

  return (
    <main>
      <Container>
        <div className="max-w-2xl mx-auto py-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight mb-10 dark:text-slate-200">
            {t("heading")}
          </h1>

          {/* 联系方式 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 dark:text-slate-200">
              {t("contactInfo")}
            </h2>
            <div className="bg-neutral-50 dark:bg-slate-800 rounded-lg p-6 space-y-3">
              <div>
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {t("address")}
                </span>
                <p className="dark:text-slate-300">
                深圳十方运动科技有限公司 Company Address Here
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {t("emailLabel")}
                </span>
                <p>
                  <a
                    href="mailto:ir@tenways.com"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    ir@tenways.com
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* 联系表单 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 dark:text-slate-200">
              {t("formTitle")}
            </h2>
            <IRContactForm />
          </section>
        </div>
      </Container>
    </main>
  );
}
