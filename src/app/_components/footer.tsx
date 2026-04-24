import { FooterToolbar } from "./footer-toolbar";

export function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 dark:bg-slate-800">
      <FooterToolbar />
      <div className="container mx-auto px-5">
        <div className="py-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
          © {new Date().getFullYear()} Tenways. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
