"use server";

import { getUserByEmail } from "@/lib/data/users";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/login?error=InvalidCredentials");
  }

  try {
    const user = await getUserByEmail(email);

    if (!user || user.password !== password) {
      throw new Error("Invalid credentials.");
    }

    const session = await getSession();
    session.userId = user.user_id;
    session.userName = user.name;
    session.role = "user";
    await session.save();
  } catch (error) {
    console.error("Login failed", error);
    // Ideally we'd return a state to useActionState, but for simplicity let's rely on standard throw for now, 
    // or just let the Next.js boundary catch it. Proper way: redirect to /login?error=true
    redirect("/login?error=InvalidCredentials");
  }

  // Redirect on success
  redirect("/dashboard");
}
