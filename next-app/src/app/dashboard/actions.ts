"use server";

import { cancelBooking as cancelBookingData } from "@/lib/data/bookings";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function cancelBooking(formData: FormData) {
  const session = await getSession();
  if (!session.userId) return;

  const bookingId = formData.get("booking_id");

  try {
    await cancelBookingData(Number(bookingId), session.userId);
    revalidatePath("/dashboard");
  } catch (err) {
    console.error("Cancel failed", err);
  }
}
