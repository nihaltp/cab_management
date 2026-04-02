"use server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function bookCab(formData: FormData) {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const pickup = formData.get("pickup_location") as string;
  const drop = formData.get("drop_location") as string;
  const cabId = formData.get("cab_id") as string;
  const date = formData.get("booking_date") as string;
  
  if (!pickup || !drop || !cabId || !date) {
    redirect("/booking?error=1");
  }

  // Get current time HH:MM:SS
  const now = new Date();
  const time = now.toTimeString().split(" ")[0];

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("booking").insert({
      user_id: session.userId,
      cab_id: Number(cabId),
      pickup_location: pickup,
      drop_location: drop,
      booking_date: date,
      booking_time: time,
      status: "Confirmed",
    });

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error("Booking error", err);
    redirect("/booking?error=1");
  }

  redirect("/booking?success=1");
}
