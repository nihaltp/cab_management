import { getSupabaseAdminClient } from "../supabase-admin";

export async function getCabs(acFilter?: string, typeFilter?: string) {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("cabs")
    .select("cab_id, cab_number, cab_type, ac_type, driver_id");

  if (acFilter && acFilter !== "All") {
    query = query.eq("ac_type", acFilter);
  }

  if (typeFilter && typeFilter !== "All") {
    query = query.eq("cab_type", typeFilter);
  }

  const { data: cabRows, error } = await query
    .order("cab_type", { ascending: true })
    .order("ac_type", { ascending: true });

  if (error) {
    throw error;
  }

  return cabRows || [];
}

export async function getCabsByDriver(driverId: number) {
  const supabase = getSupabaseAdminClient();
  const { data: cabRows, error } = await supabase
    .from("cabs")
    .select("cab_id, cab_number, cab_type, ac_type")
    .eq("driver_id", driverId);

  if (error) {
    throw error;
  }

  return cabRows || [];
}

export async function getCabsByIds(cabIds: number[]) {
  const supabase = getSupabaseAdminClient();
  const { data: cabs, error } = await supabase
    .from("cabs")
    .select("cab_id, cab_number, cab_type, driver_id")
    .in("cab_id", cabIds);

  if (error) {
    throw error;
  }

  return cabs || [];
}

export async function getCabCount() {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("cabs")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return count;
}
