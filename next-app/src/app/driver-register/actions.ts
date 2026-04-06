"use server";

import { createDriver, getDriverByEmail } from "@/lib/data/drivers";
import { redirect } from "next/navigation";
import { loginDriver } from "../driver-login/actions";

export async function registerDriver(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const licenseNo = formData.get("licenseNo") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !phone || !licenseNo || !email || !password) {
    redirect("/driver-register?error=MissingFields");
  }

  try {
    const existingDriver = await getDriverByEmail(email);

    if (existingDriver) {
      redirect("/driver-register?error=EmailExists");
    }

    await createDriver(name, phone, licenseNo, email, password);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Driver registration failed", error);
    redirect("/driver-register?error=Error");
  }

  return await loginDriver(formData);
}
