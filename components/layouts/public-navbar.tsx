"use client";

import { useState, useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Menu, X, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import CartSidebar from "@/components/layouts/cart-sidebar";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/products", label: "Promotions" },
  { href: "/categories", label: "Catégories" },
  { href: "/about", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const { cartCount, openCart } = useCart();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      <header
        className={`
          sticky top-0 z-40 w-full transition-all duration-300
          ${
            scrolled
              ? "bg-white/95 shadow-lg shadow-secondary-900/8 backdrop-blur-md"
              : "bg-white border-b border-secondary-100"
          }
        `}
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

          {/* ── Logo ─────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <img
              src="/logo.jpeg"
              alt="Sestima Confort"
              className="h-10 w-auto rounded-xl object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span className="mt-0.5 hidden text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-secondary-400 sm:block">
              Sestima Confort
            </span>
          </Link>

          {/* ── Desktop nav links ─────────────────────── */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`
                  relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200
                  ${
                    isActive(href)
                      ? "text-primary-600"
                      : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                  }
                `}
              >
                {isActive(href) && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-primary-50"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Right actions ─────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-secondary-600 transition-colors hover:bg-secondary-50 hover:text-secondary-900"
              aria-label="Ouvrir le panier"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-black text-white"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </motion.span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-secondary-600 transition-colors hover:bg-secondary-50 md:hidden"
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mobileOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ─────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-secondary-900/30 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed left-0 right-0 top-[73px] z-50 bg-white shadow-xl md:hidden"
            >
              <nav className="flex flex-col px-4 pt-4 pb-2" aria-label="Mobile navigation">
                {navLinks.map(({ href, label }, i) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  >
                    <Link
                      href={href}
                      className={`
                        flex items-center rounded-xl px-4 py-3.5 text-base font-semibold transition-all duration-150
                        ${
                          isActive(href)
                            ? "bg-primary-50 text-primary-600"
                            : "text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900"
                        }
                      `}
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Cart button in mobile menu */}
              <div className="border-t border-secondary-100 px-4 py-4">
                <button
                  onClick={() => { setMobileOpen(false); openCart(); }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white transition hover:bg-primary-700"
                >
                  <ShoppingCart size={16} />
                  Mon Panier
                  {cartCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-primary-600">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Cart Sidebar ──────────────────────────────── */}
      <CartSidebar />
    </>
  );
}
