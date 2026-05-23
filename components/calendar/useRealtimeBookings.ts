"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Suscribe a INSERT/UPDATE/DELETE en bookings + booking_holds + external_blocks
 * de una propiedad, y dispara router.refresh() (RSC re-fetch) cuando llega
 * cualquier cambio. Throttled basico (200ms) para evitar tormentas durante
 * bulk inserts (ej. sync iCal).
 *
 * Phase C6. No mantiene estado local — confia en Server Components.
 */
export function useRealtimeBookings(propertyId: string | null | undefined) {
  const router = useRouter();

  useEffect(() => {
    if (!propertyId) return;
    const supabase = createClient();

    let pending = false;
    const debouncedRefresh = () => {
      if (pending) return;
      pending = true;
      setTimeout(() => {
        pending = false;
        router.refresh();
      }, 200);
    };

    const channel = supabase
      .channel(`property:${propertyId}:bookings`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `property_id=eq.${propertyId}` },
        debouncedRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "booking_holds", filter: `property_id=eq.${propertyId}` },
        debouncedRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "external_blocks", filter: `property_id=eq.${propertyId}` },
        debouncedRefresh,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId, router]);
}
