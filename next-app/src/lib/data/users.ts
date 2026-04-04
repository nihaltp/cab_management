import { getSupabaseAdminClient } from "../supabase-admin";

export async function checkDatabaseConnection() {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("users")
    .select("user_id", { count: "exact", head: true })
    .limit(1);

  return error;
}

export async function getUserByEmail(email: string) {
  const supabase = getSupabaseAdminClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("user_id, name, password")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return user;
}

export async function getUserById(userId: number) {
  const supabase = getSupabaseAdminClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("user_id, name, email, phone")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return user;
}

export async function createUser(name: string, phone: string, email: string, password: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("users").insert({
    name,
    phone,
    email,
    password,
  });

  if (error) {
    throw error;
  }
}

export async function getUserCount() {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return count;
}

export async function getUsersByIds(userIds: number[]) {
  const supabase = getSupabaseAdminClient();
  const { data: users, error } = await supabase
    .from("users")
    .select("user_id, name, phone, email")
    .in("user_id", userIds);

  if (error) {
    throw error;
  }

  return users || [];
}
