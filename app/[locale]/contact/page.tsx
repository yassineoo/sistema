"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  Send,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import PublicNavbar from "@/components/layouts/public-navbar";
import Footer from "@/components/layouts/footer";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const contactItems = [
  {
    icon: <Phone size={22} className="text-primary-600" />,
    label: "Téléphone",
    value: "+213 555 000 000",
    href: "tel:+213555000000",
    desc: "Lun – Sam, 8h à 18h",
  },
  {
    icon: <MessageCircle size={22} className="text-primary-600" />,
    label: "WhatsApp",
    value: "Discuter sur WhatsApp",
    href: "https://wa.me/213555000000",
    desc: "Réponse rapide garantie",
  },
  {
    icon: <Mail size={22} className="text-primary-600" />,
    label: "E-mail",
    value: "contact@sestimaconfort.dz",
    href: "mailto:contact@sestimaconfort.dz",
    desc: "Réponse sous 24h",
  },
  {
    icon: <MapPin size={22} className="text-primary-600" />,
    label: "Adresse",
    value: "Algérie — toutes les wilayas",
    href: null,
    desc: "Livraison nationale",
  },
];

const hours = [
  { day: "Lundi – Vendredi", time: "8h00 – 18h00" },
  { day: "Samedi", time: "9h00 – 16h00" },
  { day: "Dimanche", time: "Fermé" },
];

const faqs = [
  {
    q: "Comment suivre ma commande ?",
    a: "Après validation de votre commande, vous recevez un numéro de commande par téléphone ou SMS. Contactez-nous directement pour avoir des nouvelles de votre livraison.",
  },
  {
    q: "Livrez-vous dans toutes les wilayas ?",
    a: "Oui ! Nous livrons dans les 58 wilayas d'Algérie, à domicile ou au bureau de poste le plus proche de chez vous.",
  },
  {
    q: "Quels sont les délais de livraison ?",
    a: "Les délais varient de 2 à 5 jours ouvrables selon votre wilaya. Les wilayas du centre (Alger, Blida, Boumerdès) sont livrées plus rapidement.",
  },
  {
    q: "Puis-je retourner un produit ?",
    a: "Oui, dans les 7 jours suivant la réception, si le produit est dans son état d'origine. Contactez-nous pour initier le retour.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-secondary-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-semibold text-secondary-900 transition-colors hover:text-primary-600"
      >
        {q}
        <ChevronDown
          size={18}
          className={`shrink-0 text-secondary-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-5 text-sm leading-relaxed text-secondary-500">{a}</p>
      )}
    </div>
  );
}

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Simulate send
    setSent(true);
  }

  return (
    <main>
      <PublicNavbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary-600 to-primary-800 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.10)_0%,transparent_70%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
            Nous joindre
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-5xl lg:text-6xl">
            Contactez-nous
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/70 sm:text-lg">
            Une question sur un produit, une commande, ou besoin d'un devis ? Notre équipe vous répond rapidement.
          </p>
        </motion.div>
      </section>

      {/* ── Main grid: contact info + form ───────────────── */}
      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">

            {/* ── Left: contact info ──────────────────────── */}
            <div className="flex flex-col gap-8">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                {contactItems.map((item) => (
                  <motion.div key={item.label} variants={fadeUp}>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="group flex gap-4 rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-primary-200 hover:shadow-md hover:shadow-primary-600/8"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 transition-colors group-hover:bg-primary-100">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wide text-secondary-400">{item.label}</p>
                          <p className="mt-0.5 truncate text-sm font-semibold text-secondary-900 transition-colors group-hover:text-primary-600">
                            {item.value}
                          </p>
                          <p className="mt-0.5 text-xs text-secondary-400">{item.desc}</p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex gap-4 rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wide text-secondary-400">{item.label}</p>
                          <p className="mt-0.5 text-sm font-semibold text-secondary-900">{item.value}</p>
                          <p className="mt-0.5 text-xs text-secondary-400">{item.desc}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {/* Hours */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
                    <Clock size={18} className="text-primary-600" />
                  </div>
                  <h3 className="font-bold text-secondary-900">Horaires d'ouverture</h3>
                </div>
                <ul className="divide-y divide-secondary-50">
                  {hours.map(({ day, time }) => (
                    <li key={day} className="flex items-center justify-between py-3 text-sm">
                      <span className="font-medium text-secondary-700">{day}</span>
                      <span className={`font-semibold ${time === "Fermé" ? "text-red-500" : "text-primary-600"}`}>
                        {time}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* WhatsApp CTA */}
              <motion.a
                href="https://wa.me/213555000000"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 font-bold text-white shadow-lg shadow-[#25D366]/25 transition-all hover:shadow-xl"
              >
                <MessageCircle size={20} />
                Discuter sur WhatsApp maintenant
              </motion.a>
            </div>

            {/* ── Right: contact form ─────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.55 }}
            >
              <div className="rounded-3xl border border-secondary-100 bg-white p-6 shadow-sm sm:p-8">
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-12 text-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
                      <CheckCircle size={32} className="text-primary-600" />
                    </div>
                    <h3 className="font-display text-xl font-black text-secondary-900">
                      Message envoyé !
                    </h3>
                    <p className="max-w-xs text-sm text-secondary-500">
                      Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setSent(false); setForm({ name: "", phone: "", email: "", message: "" }); }}
                      className="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
                    >
                      Envoyer un autre message
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="font-display text-2xl font-black text-secondary-900">
                      Envoyez-nous un message
                    </h2>
                    <p className="mt-1 text-sm text-secondary-500">
                      Remplissez le formulaire et nous vous répondrons rapidement.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold uppercase tracking-wide text-secondary-500">
                            Nom complet <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="ex. Mohamed Amine"
                            className="rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-3 text-sm text-secondary-900 placeholder:text-secondary-400 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold uppercase tracking-wide text-secondary-500">
                            Téléphone <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="05 XX XX XX XX"
                            className="rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-3 text-sm text-secondary-900 placeholder:text-secondary-400 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wide text-secondary-500">
                          E-mail (optionnel)
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="votre@email.com"
                          className="rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-3 text-sm text-secondary-900 placeholder:text-secondary-400 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wide text-secondary-500">
                          Message <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          placeholder="Décrivez votre demande, question ou besoin..."
                          className="resize-none rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-3 text-sm text-secondary-900 placeholder:text-secondary-400 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
                        />
                      </div>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-primary-600 py-4 text-sm font-bold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 hover:shadow-xl"
                      >
                        <Send size={16} />
                        Envoyer le message
                      </motion.button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="border-t border-secondary-100 bg-secondary-50/80 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center"
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-600">FAQ</p>
            <h2 className="font-display text-3xl font-black text-secondary-900 sm:text-4xl">
              Questions fréquentes
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-secondary-100 bg-white px-6 shadow-sm"
          >
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
