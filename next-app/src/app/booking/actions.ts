"use server";

import { createBooking } from "@/lib/data/bookings";
import { clientPromise } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function bookCab(formData: FormData) {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const bookingStorageMode = (process.env.BOOKINGS_STORAGE_MODE || "both").toLowerCase();
  const useSupabase = bookingStorageMode === "both";
  const useMongo = bookingStorageMode === "both" || bookingStorageMode === "mongodb";

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
    if (useSupabase) {
      await createBooking(session.userId, Number(cabId), pickup, drop, date, time);
    }

    if (useMongo) {
      const client = await clientPromise;
      const db = client.db();
      await db.collection("bookings").insertOne({
        userId: session.userId,
        cabId: Number(cabId),
        pickup_location: pickup,
        drop_location: drop,
        booking_date: date,
        status: "Confirmed",
        createdAt: new Date(),
      });
    }
  } catch (err) {
    console.error("Booking error", err);
    redirect("/booking?error=1");
  }

  redirect("/booking?success=1");
}
