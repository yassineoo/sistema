import type { Commande, CommandeStatus, Client, ClientType, User, UserRole, Notification, PaginatedResponse } from "@/types/schema";
import { FAKE_COMMANDES, FAKE_CLIENTS, FAKE_USERS, FAKE_NOTIFICATIONS } from "@/types/schema";

// ── Mutable in-memory stores (cloned from fake data at module init) ──────────
let commandes: Commande[] = FAKE_COMMANDES.map((c) => ({ ...c }));
let clients: Client[] = FAKE_CLIENTS.map((c) => ({ ...c }));
let users: User[] = FAKE_USERS.map((u) => ({ ...u }));
let notifications: Notification[] = FAKE_NOTIFICATIONS.map((n) => ({ ...n }));
let nextCommandeId = Math.max(...commandes.map((c) => c.id)) + 1;
let nextClientId = Math.max(...clients.map((c) => c.id)) + 1;

const delay = (min = 500, max = 900) => new Promise<void>((res) => setTimeout(res, min + Math.random() * (max - min)));

// ── Filter helpers ────────────────────────────────────────────────────────────
function matchSearch(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function paginate<T>(items: T[], page = 1, page_size = 10): PaginatedResponse<T> {
  const count = items.length;
  const start = (page - 1) * page_size;
  const end = start + page_size;
  const results = items.slice(start, end);
  return {
    count,
    next: end < count ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
    results,
  };
}

// ── Commandes ─────────────────────────────────────────────────────────────────
export interface GetCommandesParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: CommandeStatus | "all";
  ordering?: string;
}

async function getCommandes(params: GetCommandesParams = {}): Promise<PaginatedResponse<Commande>> {
  await delay(500, 850);
  const { page = 1, page_size = 10, search = "", status, ordering } = params;

  let filtered = [...commandes];

  if (search) {
    filtered = filtered.filter(
      (c) =>
        matchSearch(`${c.client.first_name} ${c.client.last_name}`, search) || matchSearch(c.description, search) || String(c.id).includes(search),
    );
  }

  if (status && status !== "all") {
    filtered = filtered.filter((c) => c.status === status);
  }

  if (ordering) {
    const desc = ordering.startsWith("-");
    const field = desc ? ordering.slice(1) : ordering;
    filtered.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[field];
      const bv = (b as unknown as Record<string, unknown>)[field];
      if (typeof av === "number" && typeof bv === "number") return desc ? bv - av : av - bv;
      return desc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
    });
  }

  return paginate(filtered, page, page_size);
}

async function getCommande(id: number): Promise<Commande> {
  await delay(300, 500);
  const found = commandes.find((c) => c.id === id);
  if (!found) throw new Error(`Commande #${id} introuvable`);
  return { ...found };
}

export interface CreateCommandeData {
  client_id: number;
  description: string;
  prix_total: number;
  montant_verse: number;
  delai: string;
  status?: CommandeStatus;
}

async function createCommande(data: CreateCommandeData): Promise<Commande> {
  await delay(600, 900);
  const client = clients.find((c) => c.id === data.client_id);
  if (!client) throw new Error("Client introuvable");
  const newCmd: Commande = {
    is_urgent: false,
    id: nextCommandeId++,
    client,
    description: data.description,
    prix_total: data.prix_total,
    montant_verse: data.montant_verse,
    reste: data.prix_total - data.montant_verse,
    delai: data.delai,
    status: data.status ?? "en_attente",
    pris_en_charge_par: null,
    created_by: users[0],
    created_at: new Date().toISOString(),
  };
  commandes = [newCmd, ...commandes];
  return { ...newCmd };
}

export interface UpdateCommandeData extends Partial<CreateCommandeData> {
  id: number;
}

async function updateCommande(data: UpdateCommandeData): Promise<Commande> {
  await delay(500, 800);
  const idx = commandes.findIndex((c) => c.id === data.id);
  if (idx === -1) throw new Error(`Commande #${data.id} introuvable`);
  const existing = commandes[idx];
  const client = data.client_id ? (clients.find((c) => c.id === data.client_id) ?? existing.client) : existing.client;
  const updated: Commande = {
    ...existing,
    client,
    description: data.description ?? existing.description,
    prix_total: data.prix_total ?? existing.prix_total,
    montant_verse: data.montant_verse ?? existing.montant_verse,
    delai: data.delai ?? existing.delai,
    status: data.status ?? existing.status,
    reste: (data.prix_total ?? existing.prix_total) - (data.montant_verse ?? existing.montant_verse),
  };
  commandes = commandes.map((c) => (c.id === data.id ? updated : c));
  return { ...updated };
}

async function updateCommandeStatus(id: number, status: CommandeStatus): Promise<Commande> {
  await delay(400, 700);
  const idx = commandes.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Commande #${id} introuvable`);
  const updated = { ...commandes[idx], status };
  commandes = commandes.map((c) => (c.id === id ? updated : c));
  return { ...updated };
}

async function deleteCommande(id: number): Promise<void> {
  await delay(400, 600);
  if (!commandes.find((c) => c.id === id)) throw new Error(`Commande #${id} introuvable`);
  commandes = commandes.filter((c) => c.id !== id);
}

// ── Clients ───────────────────────────────────────────────────────────────────
export interface GetClientsParams {
  page?: number;
  page_size?: number;
  search?: string;
  type?: ClientType | "all";
}

async function getClients(params: GetClientsParams = {}): Promise<PaginatedResponse<Client>> {
  await delay(450, 800);
  const { page = 1, page_size = 10, search = "", type } = params;

  let filtered = [...clients];

  if (search) {
    filtered = filtered.filter(
      (c) =>
        matchSearch(`${c.first_name} ${c.last_name}`, search) ||
        matchSearch(c.email, search) ||
        matchSearch(c.phone, search) ||
        matchSearch(c.secteur_activite, search),
    );
  }

  if (type && type !== "all") {
    filtered = filtered.filter((c) => c.type === type);
  }

  return paginate(filtered, page, page_size);
}

export type CreateClientData = Omit<Client, "id">;

async function createClient(data: CreateClientData): Promise<Client> {
  await delay(500, 800);
  const newClient: Client = { ...data, id: nextClientId++ };
  clients = [newClient, ...clients];
  return { ...newClient };
}

export interface UpdateClientData extends Partial<CreateClientData> {
  id: number;
}

async function updateClient(data: UpdateClientData): Promise<Client> {
  await delay(400, 700);
  const idx = clients.findIndex((c) => c.id === data.id);
  if (idx === -1) throw new Error(`Client #${data.id} introuvable`);
  const updated = { ...clients[idx], ...data };
  clients = clients.map((c) => (c.id === data.id ? updated : c));
  return { ...updated };
}

async function deleteClient(id: number): Promise<void> {
  await delay(400, 600);
  clients = clients.filter((c) => c.id !== id);
}

// ── Notifications ─────────────────────────────────────────────────────────────
async function getNotifications(): Promise<Notification[]> {
  await delay(400, 700);
  return notifications.map((n) => ({ ...n }));
}

async function markNotificationRead(id: number): Promise<void> {
  await delay(200, 400);
  notifications = notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
}

async function markAllNotificationsRead(): Promise<void> {
  await delay(300, 500);
  notifications = notifications.map((n) => ({ ...n, is_read: true }));
}

// ── Users ─────────────────────────────────────────────────────────────────────
export interface GetUsersParams {
  page?: number;
  page_size?: number;
  search?: string;
  role?: UserRole | "all";
}

async function getUsers(params: GetUsersParams = {}): Promise<PaginatedResponse<User>> {
  await delay(450, 750);
  const { page = 1, page_size = 20, search = "", role } = params;

  let filtered = [...users];

  if (search) {
    filtered = filtered.filter(
      (u) => matchSearch(`${u.first_name} ${u.last_name}`, search) || matchSearch(u.email, search) || matchSearch(u.username, search),
    );
  }

  if (role && role !== "all") {
    filtered = filtered.filter((u) => u.role === role);
  }

  return paginate(filtered, page, page_size);
}

// ── Dashboard stats ───────────────────────────────────────────────────────────
export interface DashboardStats {
  totalCmds: number;
  pendingCmds: number;
  totalClients: number;
  totalRevenu: number;
  totalReste: number;
  unreadNotifs: number;
  recentCmds: Commande[];
  notifications: Notification[];
}

async function getDashboardStats(): Promise<DashboardStats> {
  await delay(600, 900);
  return {
    totalCmds: commandes.length,
    pendingCmds: commandes.filter((c) => c.status === "en_attente").length,
    totalClients: clients.length,
    totalRevenu: commandes.reduce((s, c) => s + c.montant_verse, 0),
    totalReste: commandes.reduce((s, c) => s + c.reste, 0),
    unreadNotifs: notifications.filter((n) => !n.is_read).length,
    recentCmds: commandes.slice(0, 5).map((c) => ({ ...c })),
    notifications: notifications.map((n) => ({ ...n })),
  };
}

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const FALLBACK: Record<string, number> = { Lun: 82000, Mar: 97000, Mer: 54000, Jeu: 124500, Ven: 110000, Sam: 31000, Dim: 18200 };

// ── Activity feed ─────────────────────────────────────────────────────────────
export interface ActivityEvent {
  id: string;
  user: string;
  initials: string;
  action: "sale" | "login" | "clientAdded" | "revision" | "completed";
  detail: string;
  time: string;
  sub: string;
}

async function getActivityFeed(limit = 15): Promise<ActivityEvent[]> {
  await delay(500, 800);

  const events: ActivityEvent[] = [
    ...commandes.map((c) => ({
      id: `cmd-${c.id}`,
      user: `${c.created_by.first_name} ${c.created_by.last_name}`,
      initials: `${c.created_by.first_name[0]}${c.created_by.last_name[0]}`,
      action: "sale" as const,
      detail: `Commande #${c.id} — ${c.prix_total.toLocaleString("fr-DZ")} DZD`,
      time: c.created_at,
      sub: `Client : ${c.client.first_name} ${c.client.last_name}`,
    })),
    ...notifications.map((n) => ({
      id: `notif-${n.id}`,
      user: "Système",
      initials: "SY",
      action: n.type === "nouvelle_commande" ? ("clientAdded" as const) : ("revision" as const),
      detail: n.type === "nouvelle_commande" ? `Nouvelle commande #${n.commande.id}` : `Révision requise — #${n.commande.id}`,
      time: n.created_at,
      sub: `${n.commande.client.first_name} ${n.commande.client.last_name}`,
    })),
    ...users
      .filter((u) => u.last_login)
      .map((u) => ({
        id: `login-${u.id}`,
        user: `${u.first_name} ${u.last_name}`,
        initials: `${u.first_name[0]}${u.last_name[0]}`,
        action: "login" as const,
        detail: `Connexion — ${u.role}`,
        time: u.last_login ?? "",
        sub: u.email,
      })),
  ];

  return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, limit);
}

// ── Orders by day (last 7 days) ───────────────────────────────────────────────
export interface OrdersByDayPoint {
  date: string;
  label: string;
  count: number;
}

async function getOrdersByDay(): Promise<OrdersByDayPoint[]> {
  await delay(200, 400);
  const today = new Date();
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    const count = commandes.filter((c) => c.created_at.startsWith(iso)).length;
    const label = d.toLocaleDateString("fr-DZ", { weekday: "short", day: "2-digit" });
    return { date: iso, label, count };
  });
}

// ── Report stats ──────────────────────────────────────────────────────────────
export interface ReportStats {
  totalRevenu: number;
  totalReste: number;
  terminées: number;
  totalCmds: number;
  weekly: { day: string; amount: number }[];
  topClients: { client: Client; total: number; verse: number }[];
  byStatus: { status: CommandeStatus; count: number }[];
}
async function getReportStats(): Promise<ReportStats> {
  await delay(600, 900);

  const weekly = DAYS.map((d) => {
    const sum = commandes.filter((c) => DAYS[new Date(c.created_at).getDay()] === d).reduce((s, c) => s + c.prix_total, 0);
    return { day: d, amount: sum || FALLBACK[d] };
  });

  const topClients = clients
    .map((client) => {
      const cmds = commandes.filter((c) => c.client.id === client.id);
      const total = cmds.reduce((s, c) => s + c.prix_total, 0);
      const verse = cmds.reduce((s, c) => s + c.montant_verse, 0);
      return { client, total, verse };
    })
    .filter((e) => e.total > 0)
    .sort((a, b) => b.total - a.total);

  const statuses: CommandeStatus[] = ["en_attente", "en_cours_de_traitement", "terminée", "revision_requise", "en_cours_de_revision"];
  const byStatus = statuses.map((s) => ({
    status: s,
    count: commandes.filter((c) => c.status === s).length,
  }));

  return {
    totalRevenu: commandes.reduce((s, c) => s + c.montant_verse, 0),
    totalReste: commandes.reduce((s, c) => s + c.reste, 0),
    terminées: commandes.filter((c) => c.status === "terminée").length,
    totalCmds: commandes.length,
    weekly,
    topClients,
    byStatus,
  };
}

// ── Named export ──────────────────────────────────────────────────────────────
export const mockAPI = {
  // commandes

  /*
  getCommandes,
  getCommande,
  createCommande,
  updateCommande,
  updateCommandeStatus,
  deleteCommande,
  // clients
  getClients,
  createClient,
  updateClient,
  deleteClient,
  // notifications
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  // users
  getUsers,
  // aggregates
  getDashboardStats,
  getOrdersByDay,
  getActivityFeed,


*/
  getReportStats,
};
