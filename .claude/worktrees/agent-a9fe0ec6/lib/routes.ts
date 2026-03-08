export const ROUTES = {
  COMMANDES:     "commandes",
  CLIENTS:       "clients",
  NOTIFICATIONS: "notifications",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
