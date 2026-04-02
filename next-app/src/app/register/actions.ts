"use server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !phone || !email || !password) {
    redirect("/register?error=MissingFields");
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: existing, error: lookupError } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (existing) {
      redirect("/register?error=EmailExists");
    }

    const { error: insertError } = await supabase.from("users").insert({
      name,
      phone,
      email,
      password,
    });

    if (insertError) {
      throw insertError;
    }
  } catch (error) {
    console.error("Registration failed", error);
    // Cannot redirect from inside catch if redirect itself throws, wait redirect essentially throws an error to abort
    // We should safely redirect outside or rethrow if it's the redirect error.
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    
    redirect("/register?error=Error");
  }

  redirect("/login?success=1");
}
