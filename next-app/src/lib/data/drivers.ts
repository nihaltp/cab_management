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

export async function createDriver(
  name: string,
  phone: string,
  licenseNo: string,
  email: string,
  password: string,
) {
  const supabase = getSupabaseAdminClient();

  const { data: latestDriver, error: latestDriverError } = await supabase
    .from("drivers")
    .select("driver_id")
    .order("driver_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestDriverError) {
    throw latestDriverError;
  }

  const nextDriverId = (latestDriver?.driver_id ?? 0) + 1;

  const { error } = await supabase.from("drivers").insert({
    driver_id: nextDriverId,
    name,
    phone,
    license_no: licenseNo,
    email,
    password,
  });

  if (error) {
    throw error;
  }
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
