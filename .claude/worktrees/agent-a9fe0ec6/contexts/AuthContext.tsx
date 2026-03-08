"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { useGetUserInfo } from "@/hooks/auth";
import type { User } from "@/types/schema";

interface AuthContextType {
  user:    User | null;
  loading: boolean;
  error:   Error | null;
  refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<User, Error>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading: loading, error, refetch } = useGetUserInfo();

  return (
    <AuthContext.Provider value={{ user: user ?? null, loading, error, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
