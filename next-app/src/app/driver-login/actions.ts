"use server";

import { getDriverByEmail } from "@/lib/data/drivers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginDriver(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/driver-login?error=InvalidCredentials");
  }

  try {
    const driver = await getDriverByEmail(email);

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
