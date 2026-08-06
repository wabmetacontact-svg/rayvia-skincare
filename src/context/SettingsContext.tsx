"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SITE } from "@/lib/constants";

type SettingsContextType = {
  freeShippingAbove: number;
  flatShippingFee: number;
  loading: boolean;
  refreshSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [freeShippingAbove, setFreeShippingAbove] = useState<number>(SITE.freeShippingAbove);
  const [flatShippingFee, setFlatShippingFee] = useState<number>(49);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.freeShippingAbove === "number") {
          setFreeShippingAbove(data.freeShippingAbove);
        }
        if (typeof data.flatShippingFee === "number") {
          setFlatShippingFee(data.flatShippingFee);
        }
      }
    } catch (err) {
      console.warn("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        freeShippingAbove,
        flatShippingFee,
        loading,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
