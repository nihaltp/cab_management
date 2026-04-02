"use server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginAdmin(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    redirect("/admin-login?error=InvalidCredentials");
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: admin, error } = await supabase
      .from("admin")
      .select("admin_id, username, password")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!admin || admin.password !== password) {
      throw new Error("Invalid credentials.");
    }

    const session = await getSession();
    session.adminId = admin.admin_id;
    session.userName = admin.username;
    session.role = "admin";
    await session.save();
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    redirect("/admin-login?error=InvalidCredentials");
  }

  redirect("/admin-dashboard");
}
