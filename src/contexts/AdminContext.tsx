import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "moderator";
}

export interface AdminContextType {
  currentAdmin: AdminUser | null;
  isLoading: boolean;
  login:  (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider = ({ children }: { children: ReactNode }): React.ReactElement => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [isLoading,    setIsLoading]    = useState(false);

  const login = async (email: string, _password: string): Promise<void> => {
    setIsLoading(true);
    try {
      setCurrentAdmin({ id: "1", email, name: "Admin", role: "admin" });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => setCurrentAdmin(null);

  return (
    <AdminContext.Provider value={{ currentAdmin, isLoading, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be inside AdminProvider");
  return ctx;
};


