"use server";

import { getAdminByUsername } from "@/lib/data/admins";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginAdmin(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    redirect("/admin-login?error=InvalidCredentials");
  }

  try {
    const admin = await getAdminByUsername(username);

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
