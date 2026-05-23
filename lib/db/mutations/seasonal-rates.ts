import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapDbError, NotFoundError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type SeasonalRateRow    = Database["public"]["Tables"]["seasonal_rates"]["Row"];
type SeasonalRateInsert = Database["public"]["Tables"]["seasonal_rates"]["Insert"];
type SeasonalRateUpdate = Database["public"]["Tables"]["seasonal_rates"]["Update"];

export async function createSeasonalRate(input: {
  roomTypeId: string;
  name?: string | null;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  priceCents: number;
  priority?: number;
}): Promise<SeasonalRateRow> {
  const supabase = await createClient();

  const payload: SeasonalRateInsert = {
    room_type_id: input.roomTypeId,
    name: input.name ?? null,
    start_date: input.startDate,
    end_date: input.endDate,
    price_cents: input.priceCents,
    priority: input.priority ?? 0,
  };

  const { data, error } = await supabase
    .from("seasonal_rates")
    .insert(payload)
    .select()
    .maybeSingle();

  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Tarifa estacional");
  return data;
}

export async function updateSeasonalRate(
  id: string,
  patch: SeasonalRateUpdate,
): Promise<SeasonalRateRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seasonal_rates")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw mapDbError(error);
  if (!data) throw new NotFoundError("Tarifa estacional");
  return data;
}

export async function deleteSeasonalRate(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("seasonal_rates").delete().eq("id", id);
  if (error) throw mapDbError(error);
}
