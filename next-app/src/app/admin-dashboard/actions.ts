"use server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateAdminTripStatus(formData: FormData) {
  const session = await getSession();
  if (!session.adminId) return;

  const bookingId = formData.get("booking_id");
  const newStatus = formData.get("new_status");

  if (newStatus !== "Picked" && newStatus !== "Dropped") return;

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("booking")
      .update({ status: newStatus })
      .eq("booking_id", Number(bookingId));

    if (error) {
      throw error;
    }

    revalidatePath("/admin-dashboard");
  } catch (err) {
    console.error("Status update failed", err);
  }
}
