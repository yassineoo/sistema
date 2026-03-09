"use client";

import { motion, type Variants } from "framer-motion";
import {
  Shield,
  Truck,
  HeartHandshake,
  Award,
  Package,
  Users,
  MapPin,
  Wrench,
  CheckCircle,
} from "lucide-react";
import PublicNavbar from "@/components/layouts/public-navbar";
import Footer from "@/components/layouts/footer";
import { Link } from "@/i18n/navigation";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const stats = [
  { value: "10+", label: "Ans d'expérience", icon: <Award size={22} /> },
  { value: "500+", label: "Produits disponibles", icon: <Package size={22} /> },
  { value: "58", label: "Wilayas desservies", icon: <MapPin size={22} /> },
  { value: "5000+", label: "Clients satisfaits", icon: <Users size={22} /> },
];

const values = [
  {
    icon: <Shield size={28} className="text-primary-600" />,
    title: "Qualité garantie",
    desc: "Chaque produit est soigneusement sélectionné pour répondre aux normes les plus élevées. Nous ne commercialisons que ce en quoi nous croyons.",
  },
  {
    icon: <Truck size={28} className="text-primary-600" />,
    title: "Livraison dans toute l'Algérie",
    desc: "Nous livrons dans les 58 wilayas, à domicile ou via les bureaux de poste. Votre commande arrive rapidement, où que vous soyez.",
  },
  {
    icon: <HeartHandshake size={28} className="text-primary-600" />,
    title: "Service client dédié",
    desc: "Notre équipe est disponible pour vous conseiller, répondre à vos questions et assurer votre satisfaction à chaque étape.",
  },
  {
    icon: <Wrench size={28} className="text-primary-600" />,
    title: "Expertise métier",
    desc: "Professionnels du bâtiment, plombiers, cuisinistes — nous comprenons vos besoins et vous proposons les bons outils pour chaque chantier.",
  },
];

const timeline = [
  {
    year: "2014",
    title: "Fondation",
    desc: "Sestima Confort naît d'une passion pour le bâtiment et l'équipement professionnel. Premiers produits, premiers clients.",
  },
  {
    year: "2017",
    title: "Expansion nationale",
    desc: "Ouverture de la livraison dans les 58 wilayas. Notre réseau logistique s'étend à toute l'Algérie.",
  },
  {
    year: "2020",
    title: "Catalogue enrichi",
    desc: "Lancement de la gamme cuisine et plomberie. Plus de 500 références disponibles, du matériau de gros œuvre à la finition.",
  },
  {
    year: "2024",
    title: "Boutique en ligne",
    desc: "Commandez directement en ligne, en quelques clics, avec livraison garantie partout en Algérie.",
  },
];

const commitments = [
  "Produits authentiques, jamais de contrefaçon",
  "Prix compétitifs avec transparence totale",
  "Emballage soigné pour éviter les casses",
  "Délais de livraison respectés",
  "Échange ou remboursement en cas de problème",
  "Conseils professionnels gratuits",
];

export default function AboutPage() {
  return (
    <main>
      <PublicNavbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary-600 to-primary-800 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_0%,rgba(255,255,255,0.10)_0%,transparent_70%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
              Notre histoire
            </span>
            <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-5xl lg:text-6xl">
              À propos de
              <br />
              <span className="text-white/80">Sestima Confort</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Depuis 2014, nous équipons les professionnels et particuliers algériens avec des produits de qualité — matériaux, outils, cuisine et plomberie.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────── */}
      <section className="border-b border-secondary-100 bg-white">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-secondary-100 md:grid-cols-4"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="flex flex-col items-center gap-2 px-4 py-8 text-center"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                {s.icon}
              </span>
              <span className="font-display text-3xl font-black text-secondary-900 sm:text-4xl">
                {s.value}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
                {s.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Story section ────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Text */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="flex flex-col justify-center"
            >
              <motion.p variants={fadeUp} className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-600">
                Qui sommes-nous
              </motion.p>
              <motion.h2 variants={fadeUp} className="font-display text-3xl font-black text-secondary-900 sm:text-4xl">
                Votre partenaire de confiance depuis 10 ans
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 text-base leading-relaxed text-secondary-600">
                Sestima Confort est née d'une vision simple : rendre accessibles les meilleurs matériaux de construction, outils professionnels et équipements de cuisine à tous les Algériens, où qu'ils se trouvent.
              </motion.p>
              <motion.p variants={fadeUp} className="mt-4 text-base leading-relaxed text-secondary-600">
                En 10 ans, nous avons bâti une relation de confiance avec des milliers de clients — artisans, architectes, particuliers — en misant sur la qualité, la transparence et un service impeccable.
              </motion.p>

              {/* Commitments */}
              <motion.ul variants={stagger} className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {commitments.map((c) => (
                  <motion.li
                    key={c}
                    variants={fadeUp}
                    className="flex items-start gap-2.5 text-sm text-secondary-700"
                  >
                    <CheckCircle size={16} className="mt-0.5 shrink-0 text-primary-600" />
                    {c}
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div variants={fadeUp} className="mt-10">
                <Link
                  href="/products"
                  className="inline-flex items-center rounded-2xl bg-primary-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-600/25 transition-all duration-200 hover:bg-primary-700 hover:shadow-xl"
                >
                  Voir notre catalogue
                </Link>
              </motion.div>
            </motion.div>

            {/* Image / visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary-600 to-primary-800 shadow-2xl shadow-primary-900/20">
                <img
                  src="/hero2.png"
                  alt="Sestima Confort — matériaux et outils"
                  className="w-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-linear-to-tl from-primary-900/40 via-transparent to-transparent" />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-5 -left-5 rounded-2xl border border-primary-100 bg-white px-5 py-4 shadow-xl">
                <p className="text-xs font-bold uppercase tracking-widest text-primary-600">
                  Fondée en
                </p>
                <p className="mt-0.5 font-display text-3xl font-black text-secondary-900">2014</p>
                <p className="mt-0.5 text-xs text-secondary-500">Alger, Algérie</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Values grid ──────────────────────────────────── */}
      <section className="bg-secondary-50/80 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-600">Ce qui nous définit</p>
            <h2 className="font-display text-3xl font-black text-secondary-900 sm:text-4xl">
              Nos valeurs fondamentales
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            {values.map((v) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="flex gap-5 rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm hover:shadow-lg hover:shadow-secondary-900/6 transition-shadow duration-300"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50">
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-bold text-secondary-900">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-secondary-500">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-600">Notre parcours</p>
            <h2 className="font-display text-3xl font-black text-secondary-900 sm:text-4xl">
              10 ans d'évolution
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="relative"
          >
            {/* Vertical line */}
            <div className="absolute left-7 top-0 bottom-0 w-px bg-primary-100 sm:left-1/2" />

            <div className="flex flex-col gap-10">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  variants={fadeUp}
                  className={`relative flex items-start gap-6 sm:gap-0 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  {/* Content box */}
                  <div className={`flex-1 rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm ${i % 2 === 0 ? "sm:mr-12" : "sm:ml-12"} ml-10 sm:ml-0`}>
                    <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                      {item.year}
                    </span>
                    <h3 className="mt-2 font-bold text-secondary-900">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-secondary-500">{item.desc}</p>
                  </div>

                  {/* Dot */}
                  <div className="absolute left-5 top-5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary-600 bg-white shadow-sm sm:left-1/2 sm:-translate-x-1/2">
                    <div className="h-2 w-2 rounded-full bg-primary-600" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA bottom ───────────────────────────────────── */}
      <section className="bg-linear-to-br from-primary-600 to-primary-800 px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
            Prêt à passer commande ?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/70">
            Parcourez notre catalogue et commandez en quelques clics. Livraison rapide dans toute l'Algérie.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-primary-700 shadow-xl transition-all hover:shadow-2xl"
            >
              Voir le catalogue
            </Link>
            <Link
              href="/contact"
              className="rounded-2xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              Nous contacter
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
