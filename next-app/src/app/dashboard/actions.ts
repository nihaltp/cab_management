"use server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function cancelBooking(formData: FormData) {
  const session = await getSession();
  if (!session.userId) return;

  const bookingId = formData.get("booking_id");

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("booking")
      .update({ status: "Cancelled" })
      .eq("booking_id", Number(bookingId))
      .eq("user_id", session.userId);

    if (error) {
      throw error;
    }

    revalidatePath("/dashboard");
  } catch (err) {
    console.error("Cancel failed", err);
  }
}
