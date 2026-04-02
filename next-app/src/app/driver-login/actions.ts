"use server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginDriver(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/driver-login?error=InvalidCredentials");
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: driver, error } = await supabase
      .from("drivers")
      .select("driver_id, name, password")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!driver || driver.password !== password) {
      throw new Error("Invalid credentials.");
    }

    const session = await getSession();
    session.driverId = driver.driver_id;
    session.userName = driver.name;
    session.role = "driver";
    await session.save();
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    redirect("/driver-login?error=InvalidCredentials");
  }

  redirect("/driver-dashboard");
}
