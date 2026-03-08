// ── User ─────────────────────────────────────────────────────────────────────
export type UserRole = "opérateur" | "infographe" | "directeur" | "secrétaire" | "agent_polyvalent";

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  last_login: string | null;
  date_joined?: string | null;
}

// ── Client ────────────────────────────────────────────────────────────────────
export type ClientType = "normal" | "sous_traitant" | "direction";

export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  secteur_activite: string;
  email: string;
  phone: string;
  type: ClientType;
  adresse: string;
  delai: string | null; // ISO datetime or null
  created_at: string;
}

// ── Commande ──────────────────────────────────────────────────────────────────
export type CommandeStatus = "en_attente" | "en_cours_de_traitement" | "terminée" | "revision_requise" | "en_cours_de_revision";

export interface Commande {
  id: number;
  client: Client;
  description: string;
  prix_total: number;
  montant_verse: number;
  reste: number; // computed: prix_total - montant_verse
  delai: string; // ISO date
  status: CommandeStatus;
  is_urgent: boolean;
  pris_en_charge_par: User | null;
  created_by: User;
  created_at: string; // ISO datetime
}

// ── Commande Image ────────────────────────────────────────────────────────────
export interface CommandeImage {
  id: number;
  url: string;
  uploaded_at: string;
}

// ── Versement ─────────────────────────────────────────────────────────────────
export interface Versement {
  id: number;
  commande: number;
  amount: number | string;
  date: string;
  created_at: string;
}

// ── Commande (API list item — includes embedded versements) ───────────────────
export interface CommandeListItem {
  id: number;
  client_name: string;
  status: CommandeStatus;
  is_urgent: boolean;
  delai: string;
  created_at: string;
  pris_en_charge_par_name: string;
  created_by_name: string;
  client_phone?: string;
  prix_total: string | number;
  montant_verse: string | number;
  reste: string | number; // prix_total − montant_verse (stored); subtract sum(versements) for true remaining
  versements: Versement[];
}

// ── Commande (API detail — full) ─────────────────────────────────────────────
export interface CommandeDetail {
  id: number;
  client: Client;
  prix_total: string;
  montant_verse: string;
  reste: string;
  delai: string;
  description: string;
  status: CommandeStatus;
  is_urgent: boolean;
  images: CommandeImage[];
  versements?: Versement[];
  pris_en_charge_par_name: string;
  created_by_name: string;
  created_at: string;
}

// ── Notification ──────────────────────────────────────────────────────────────
export type NotificationType = "nouvelle_commande" | "revision_requise";

export interface Notification {
  id: number;
  type: NotificationType;
  commande: Commande;
  created_at: string;
  is_read: boolean; // from NotificationUser.is_read
}

// ── Paginated API response ────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── Fake data helpers ─────────────────────────────────────────────────────────
export const FAKE_USERS: User[] = [
  {
    id: 1,
    username: "ahmed.manager",
    first_name: "Ahmed",
    last_name: "Benali",
    email: "ahmed@ibnbadis.dz",
    role: "directeur",
    is_active: true,
    last_login: "2026-02-17T09:00:00Z",
  },
  {
    id: 2,
    username: "sara.op",
    first_name: "Sara",
    last_name: "Mouloud",
    email: "sara@ibnbadis.dz",
    role: "opérateur",
    is_active: true,
    last_login: "2026-02-17T07:50:00Z",
  },
  {
    id: 3,
    username: "karim.infog",
    first_name: "Karim",
    last_name: "Belaid",
    email: "karim@ibnbadis.dz",
    role: "infographe",
    is_active: true,
    last_login: "2026-02-17T08:52:00Z",
  },
  {
    id: 4,
    username: "nadia.sec",
    first_name: "Nadia",
    last_name: "Haddad",
    email: "nadia@ibnbadis.dz",
    role: "secrétaire",
    is_active: true,
    last_login: "2026-02-16T08:15:00Z",
  },
  {
    id: 5,
    username: "rafik.poly",
    first_name: "Rafik",
    last_name: "Chaabane",
    email: "rafik@ibnbadis.dz",
    role: "agent_polyvalent",
    is_active: false,
    last_login: "2026-02-10T09:30:00Z",
  },
];

export const FAKE_CLIENTS: Client[] = [
  {
    id: 1,
    first_name: "Amira",
    last_name: "Touati",
    secteur_activite: "Éducation",
    email: "amira@touati.dz",
    phone: "0555 12 34 56",
    type: "normal",
    adresse: "Alger Centre",
    delai: "2026-02-24T00:00:00Z",
    created_at: "2026-01-10T09:00:00Z",
  },
  {
    id: 2,
    first_name: "Mehdi",
    last_name: "Larbi",
    secteur_activite: "Commerce",
    email: "mehdi@larbi.dz",
    phone: "0661 98 76 54",
    type: "sous_traitant",
    adresse: "Oran",
    delai: "2026-02-20T00:00:00Z",
    created_at: "2026-01-12T10:00:00Z",
  },
  {
    id: 3,
    first_name: "Fatima",
    last_name: "Bensalem",
    secteur_activite: "Santé",
    email: "fatima@bensalem.dz",
    phone: "0770 45 67 89",
    type: "normal",
    adresse: "Constantine",
    delai: null,
    created_at: "2026-01-15T11:00:00Z",
  },
  {
    id: 4,
    first_name: "Youcef",
    last_name: "Ait Ali",
    secteur_activite: "Administration",
    email: "youcef@govt.dz",
    phone: "0550 33 22 11",
    type: "direction",
    adresse: "Tizi Ouzou",
    delai: "2026-03-01T00:00:00Z",
    created_at: "2026-01-18T08:00:00Z",
  },
  {
    id: 5,
    first_name: "Lynda",
    last_name: "Ouali",
    secteur_activite: "BTP",
    email: "lynda@ouali.dz",
    phone: "0661 00 11 22",
    type: "sous_traitant",
    adresse: "Béjaïa",
    delai: "2026-02-19T00:00:00Z",
    created_at: "2026-01-20T14:00:00Z",
  },
  {
    id: 6,
    first_name: "Sofiane",
    last_name: "Brahimi",
    secteur_activite: "Industrie",
    email: "sofiane@brahimi.dz",
    phone: "0770 55 66 77",
    type: "normal",
    adresse: "Annaba",
    delai: "2026-02-27T00:00:00Z",
    created_at: "2026-01-25T09:00:00Z",
  },
  {
    id: 7,
    first_name: "Nora",
    last_name: "Hamidi",
    secteur_activite: "Tourisme",
    email: "nora@hamidi.dz",
    phone: "0550 99 88 77",
    type: "normal",
    adresse: "Skikda",
    delai: null,
    created_at: "2026-02-01T10:00:00Z",
  },
];

export const FAKE_COMMANDES: Commande[] = [
  {
    is_urgent: false,
    id: 1042,
    client: FAKE_CLIENTS[0],
    description: "Impression de 500 flyers A5 recto-verso couleur",
    prix_total: 12500,
    montant_verse: 5000,
    reste: 7500,
    delai: "2026-02-20",
    status: "en_attente",
    pris_en_charge_par: null,
    created_by: FAKE_USERS[1],
    created_at: "2026-02-17T09:14:00Z",
  },
  {
    is_urgent: false,

    id: 1041,
    client: FAKE_CLIENTS[1],
    description: "Banderole 3×1m impression grand format",
    prix_total: 31000,
    montant_verse: 31000,
    reste: 0,
    delai: "2026-02-18",
    status: "terminée",
    pris_en_charge_par: FAKE_USERS[2],
    created_by: FAKE_USERS[1],
    created_at: "2026-02-17T08:45:00Z",
  },
  {
    is_urgent: false,

    id: 1040,
    client: FAKE_CLIENTS[4],
    description: "Cartes de visite 250 exemplaires plastifiées",
    prix_total: 18200,
    montant_verse: 9000,
    reste: 9200,
    delai: "2026-02-19",
    status: "en_cours_de_traitement",
    pris_en_charge_par: FAKE_USERS[2],
    created_by: FAKE_USERS[3],
    created_at: "2026-02-17T08:30:00Z",
  },
  {
    is_urgent: false,

    id: 1039,
    client: FAKE_CLIENTS[3],
    description: "Tampons encreurs personnalisés x5",
    prix_total: 4800,
    montant_verse: 4800,
    reste: 0,
    delai: "2026-02-17",
    status: "terminée",
    pris_en_charge_par: FAKE_USERS[4],
    created_by: FAKE_USERS[3],
    created_at: "2026-02-16T17:55:00Z",
  },
  {
    is_urgent: false,

    id: 1038,
    client: FAKE_CLIENTS[5],
    description: "Roll-up 85×200cm avec impression UV",
    prix_total: 9000,
    montant_verse: 4500,
    reste: 4500,
    delai: "2026-02-22",
    status: "en_attente",
    pris_en_charge_par: null,
    created_by: FAKE_USERS[1],
    created_at: "2026-02-16T16:10:00Z",
  },
  {
    is_urgent: false,

    id: 1037,
    client: FAKE_CLIENTS[2],
    description: "Brochure 8 pages A4 plié, 200 ex.",
    prix_total: 6300,
    montant_verse: 0,
    reste: 6300,
    delai: "2026-02-21",
    status: "revision_requise",
    pris_en_charge_par: FAKE_USERS[2],
    created_by: FAKE_USERS[1],
    created_at: "2026-02-16T14:30:00Z",
  },
  {
    is_urgent: false,

    id: 1036,
    client: FAKE_CLIENTS[6],
    description: "Stylos publicitaires gravés x100",
    prix_total: 2200,
    montant_verse: 2200,
    reste: 0,
    delai: "2026-02-18",
    status: "en_cours_de_revision",
    pris_en_charge_par: FAKE_USERS[4],
    created_by: FAKE_USERS[3],
    created_at: "2026-02-16T11:20:00Z",
  },
  {
    is_urgent: false,

    id: 1035,
    client: FAKE_CLIENTS[1],
    description: "Affiche A0 plastifiée x10",
    prix_total: 22400,
    montant_verse: 22400,
    reste: 0,
    delai: "2026-02-15",
    status: "terminée",
    pris_en_charge_par: FAKE_USERS[2],
    created_by: FAKE_USERS[1],
    created_at: "2026-02-16T09:00:00Z",
  },
];

export const FAKE_NOTIFICATIONS: Notification[] = [
  { id: 1, type: "nouvelle_commande", commande: FAKE_COMMANDES[0], created_at: "2026-02-17T09:14:00Z", is_read: false },
  { id: 2, type: "revision_requise", commande: FAKE_COMMANDES[5], created_at: "2026-02-16T14:30:00Z", is_read: false },
  { id: 3, type: "nouvelle_commande", commande: FAKE_COMMANDES[4], created_at: "2026-02-16T16:10:00Z", is_read: true },
];
