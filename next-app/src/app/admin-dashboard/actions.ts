"use server";

import { updateBookingStatus } from "@/lib/data/bookings";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateAdminTripStatus(formData: FormData) {
  const session = await getSession();
  if (!session.adminId) return;

  const bookingId = formData.get("booking_id");
  const newStatus = formData.get("new_status") as string;

  if (newStatus !== "Picked" && newStatus !== "Dropped") return;

  try {
    await updateBookingStatus(Number(bookingId), newStatus);
    revalidatePath("/admin-dashboard");
  } catch (err) {
    console.error("Status update failed", err);
  }
}
