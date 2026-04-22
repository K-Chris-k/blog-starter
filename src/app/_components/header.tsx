import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const Header = () => {
  const t = useTranslations("Header");

  return (
    <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight mb-20 mt-8 flex items-center">
      <Link href="/" className="hover:underline">
        {t("blog")}
      </Link>
      .
    </h2>
  );
};

export default Header;
