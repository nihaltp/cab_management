"use server";

import { getUserByEmail, createUser } from "@/lib/data/users";
import { redirect } from "next/navigation";
import { loginUser } from "../login/actions";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !phone || !email || !password) {
    redirect("/register?error=MissingFields");
  }

  try {
    const existing = await getUserByEmail(email);

    if (existing) {
      console.log("Email already exists, trying to log in instead");
      return await loginUser(formData);
    }

    await createUser(name, phone, email, password);
  } catch (error) {
    console.error("Registration failed", error);
    // Cannot redirect from inside catch if redirect itself throws, wait redirect essentially throws an error to abort
    // We should safely redirect outside or rethrow if it's the redirect error.
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    
    redirect("/register?error=Error");
  }

  return await loginUser(formData);
}
