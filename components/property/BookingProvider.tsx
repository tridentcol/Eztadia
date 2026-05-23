"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Property } from "@/lib/properties";

type BookingState = {
  property: Property;
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  childrenCount: number;
  nights: number;
  setRange: (start: Date | null, end: Date | null) => void;
  setAdults: (n: number) => void;
  setChildren: (n: number) => void;
};

const Ctx = createContext<BookingState | null>(null);

export function BookingProvider({
  property,
  children,
}: {
  property: Property;
  children: ReactNode;
}) {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildren] = useState(0);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000));
  }, [checkIn, checkOut]);

  const value: BookingState = {
    property,
    checkIn,
    checkOut,
    adults,
    childrenCount,
    nights,
    setRange: (s, e) => {
      setCheckIn(s);
      setCheckOut(e);
    },
    setAdults,
    setChildren,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBooking() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}
