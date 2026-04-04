import { getSupabaseAdminClient } from "../supabase-admin";

export async function getDriverByEmail(email: string) {
  const supabase = getSupabaseAdminClient();
  const { data: driver, error } = await supabase
    .from("drivers")
    .select("driver_id, name, password")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return driver;
}

export async function getDriversByIds(driverIds: number[]) {
  const supabase = getSupabaseAdminClient();
  const { data: drivers, error } = await supabase
    .from("drivers")
    .select("driver_id, name, phone, license_no")
    .in("driver_id", driverIds);

  if (error) {
    throw error;
  }

  return drivers || [];
}

export async function getDriversBasicInfo(driverIds: number[]) {
  const supabase = getSupabaseAdminClient();
  const { data: drivers, error } = await supabase
    .from("drivers")
    .select("driver_id, name, phone")
    .in("driver_id", driverIds);

  if (error) {
    throw error;
  }

  return drivers || [];
}

export async function getDriverCount() {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("drivers")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return count;
}
