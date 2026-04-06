import { getSupabaseAdminClient } from "../supabase-admin";

export async function getUserRegistrationLogs(limit = 50) {
  const supabase = getSupabaseAdminClient();
  const { data: logs, error } = await supabase
    .from("user_registration_logs")
    .select("log_id, user_id, registered_name, registered_email, registration_timestamp")
    .order("registration_timestamp", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return logs || [];
}
