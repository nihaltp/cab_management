import { getSupabaseAdminClient } from "../supabase-admin";

export async function getAdminByUsername(username: string) {
  const supabase = getSupabaseAdminClient();
  const { data: admin, error } = await supabase
    .from("admin")
    .select("admin_id, username, password")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return admin;
}

export async function getAdminCount() {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("admin")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return count;
}
