"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LocaleSwitcher } from "./locale-switcher";

type NavItem = {
  key: string;
  href?: string;
  children?: { key: string; href: string }[];
};

const navItems: NavItem[] = [
  { key: "home", href: "/" },
  {
    key: "posts",
    children: [
      { key: "allPosts", href: "/" },
      { key: "categories", href: "/" },
      { key: "archives", href: "/" },
    ],
  },
  {
    key: "about",
    children: [
      { key: "aboutUs", href: "/" },
      { key: "authors", href: "/" },
    ],
  },
  
  { key: "contact", href: "/" },
];

export function Navbar() {
  const t = useTranslations("Navbar");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const handleEnter = (key: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenMenu(key);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenMenu(null), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const isExternal = (href: string) => href.startsWith("http");

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            className="text-white font-bold text-xl tracking-tight shrink-0"
          >
            {("Tenways")}
          </Link>

          <ul className="hidden md:flex items-center gap-1 h-full">
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenu === item.key;

              return (
                <li
                  key={item.key}
                  className="relative h-14 flex items-center"
                  onMouseEnter={() => hasChildren && handleEnter(item.key)}
                  onMouseLeave={handleLeave}
                >
                  {hasChildren ? (
                    <button
                      className={`flex items-center gap-1 px-4 h-full text-sm transition-colors ${
                        isOpen
                          ? "text-amber-500 border-b-2 border-amber-500"
                          : "text-neutral-300 hover:text-white border-b-2 border-transparent"
                      }`}
                      onClick={() => setOpenMenu(isOpen ? null : item.key)}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                    >
                      {t(`items.${item.key}`)}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      href={item.href!}
                      className="px-4 h-full flex items-center text-sm text-neutral-300 hover:text-white border-b-2 border-transparent hover:border-amber-500 transition-colors"
                    >
                      {t(`items.${item.key}`)}
                    </Link>
                  )}

                  {hasChildren && isOpen && (
                    <div
                      className="absolute top-full left-0 min-w-[200px] bg-neutral-900/95 backdrop-blur-sm border border-neutral-800 shadow-xl"
                      onMouseEnter={() => handleEnter(item.key)}
                      onMouseLeave={handleLeave}
                    >
                      {item.children!.map((child) =>
                        isExternal(child.href) ? (
                          <a
                            key={child.key}
                            href={child.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-5 py-3 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                          >
                            {t(`items.${child.key}`)}
                          </a>
                        ) : (
                          <Link
                            key={child.key}
                            href={child.href}
                            className="block px-5 py-3 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                            onClick={() => setOpenMenu(null)}
                          >
                            {t(`items.${child.key}`)}
                          </Link>
                        ),
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <MobileMenuButton
              onClick={() =>
                setOpenMenu(openMenu === "_mobile" ? null : "_mobile")
              }
              isOpen={openMenu === "_mobile"}
            />
          </div>
        </div>
      </div>

      {openMenu === "_mobile" && (
        <MobileMenu items={navItems} t={t} onClose={() => setOpenMenu(null)} />
      )}
    </nav>
  );
}

function MobileMenuButton({
  onClick,
  isOpen,
}: {
  onClick: () => void;
  isOpen: boolean;
}) {
  return (
    <button
      className="md:hidden p-2 text-neutral-300 hover:text-white"
      onClick={onClick}
      aria-label="Toggle menu"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {isOpen ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );
}

function MobileMenu({
  items,
  t,
  onClose,
}: {
  items: NavItem[];
  t: ReturnType<typeof useTranslations>;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const isExternal = (href: string) => href.startsWith("http");

  return (
    <div className="md:hidden border-t border-neutral-800 bg-neutral-900/95 backdrop-blur-sm">
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = expanded === item.key;

        return (
          <div key={item.key}>
            {hasChildren ? (
              <>
                <button
                  className={`w-full flex items-center justify-between px-6 py-3 text-sm transition-colors ${
                    isOpen
                      ? "text-amber-500 bg-neutral-800/50"
                      : "text-neutral-300"
                  }`}
                  onClick={() => setExpanded(isOpen ? null : item.key)}
                >
                  {t(`items.${item.key}`)}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isOpen && (
                  <div className="bg-neutral-950/60">
                    {item.children!.map((child) =>
                      isExternal(child.href) ? (
                        <a
                          key={child.key}
                          href={child.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-10 py-3 text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                          {t(`items.${child.key}`)}
                        </a>
                      ) : (
                        <Link
                          key={child.key}
                          href={child.href}
                          className="block px-10 py-3 text-sm text-neutral-400 hover:text-white transition-colors"
                          onClick={onClose}
                        >
                          {t(`items.${child.key}`)}
                        </Link>
                      ),
                    )}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href!}
                className="block px-6 py-3 text-sm text-neutral-300 hover:text-white transition-colors"
                onClick={onClose}
              >
                {t(`items.${item.key}`)}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
