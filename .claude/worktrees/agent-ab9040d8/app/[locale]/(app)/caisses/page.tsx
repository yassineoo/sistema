import { useTranslations } from "next-intl";
import { CreditCard, Wifi, WifiOff, TrendingUp } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const TERMINALS = [
  { id: "C-01", cashier: "Sara Mouloud",  open: true,  sales: "48 200 DZD", tx: 18 },
  { id: "C-02", cashier: "Karim Belaid", open: true,  sales: "31 500 DZD", tx: 12 },
  { id: "C-03", cashier: "Nadia Haddad",  open: true,  sales: "44 800 DZD", tx: 17 },
  { id: "C-04", cashier: "—",             open: false, sales: "0 DZD",      tx: 0  },
  { id: "C-05", cashier: "—",             open: false, sales: "0 DZD",      tx: 0  },
];

export default function CaissesPage() {
  const t  = useTranslations("Pages.Caisses");
  const tp = useTranslations("Pages");

  return (
    <div className="flex flex-col min-h-full bg-accent">
      <PageHeader title={t("title")} subtitle={t("subtitle")} icon={CreditCard} />

      <div className="p-4 sm:p-8">
        {/* Summary bar */}
        <div className="mb-6 flex gap-4">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-3">
            <p className="text-xs text-emerald-600 font-medium">{tp("active")}</p>
            <p className="text-2xl font-bold text-emerald-700">3</p>
          </div>
          <div className="rounded-xl border border-secondary-100 bg-white px-5 py-3">
            <p className="text-xs text-secondary-400 font-medium">{tp("inactive")}</p>
            <p className="text-2xl font-bold text-secondary-500">2</p>
          </div>
          <div className="rounded-xl border border-primary-100 bg-primary-50 px-5 py-3">
            <p className="text-xs text-primary-600 font-medium">{t("salesToday")}</p>
            <p className="text-2xl font-bold text-primary-700">124 500 DZD</p>
          </div>
        </div>

        {/* Terminal cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {TERMINALS.map((terminal) => (
            <div
              key={terminal.id}
              className={`rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md
                ${terminal.open ? "border-secondary-100" : "border-secondary-100 opacity-60"}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-900 text-white font-bold text-sm">
                  {terminal.id}
                </div>
                <span
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold
                    ${terminal.open
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-secondary-100 text-secondary-500"}`}
                >
                  {terminal.open
                    ? <><Wifi size={11} />{t("open")}</>
                    : <><WifiOff size={11} />{t("closed")}</>}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs text-secondary-400">{t("cashier")}</p>
                <p className="text-sm font-semibold text-secondary-800 mt-0.5">{terminal.cashier}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-secondary-50 p-3">
                  <p className="text-[11px] text-secondary-400">{t("salesToday")}</p>
                  <p className="mt-0.5 text-sm font-bold text-secondary-900">{terminal.sales}</p>
                </div>
                <div className="rounded-xl bg-secondary-50 p-3">
                  <p className="text-[11px] text-secondary-400">{t("transactions")}</p>
                  <p className="mt-0.5 text-sm font-bold text-secondary-900">{terminal.tx}</p>
                </div>
              </div>

              {terminal.open && (
                <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary-200 py-2 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-50">
                  <TrendingUp size={13} />
                  {tp("viewAll")}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
