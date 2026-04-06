"use server";

import { updateBookingStatus } from "@/lib/data/bookings";
import { cabHasBookings } from "@/lib/data/bookings";
import { createCabForDriver, deleteCabByIdAndDriver, getCabByNumber } from "@/lib/data/cabs";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateTripStatus(formData: FormData) {
  const session = await getSession();
  if (!session.driverId) return;

  const bookingId = formData.get("booking_id");
  const newStatus = formData.get("new_status") as string;

  // Basic validation to ensure they only set valid statuses
  if (newStatus !== "Picked" && newStatus !== "Dropped") return;

  try {
    // Ideally we should also verify that the booking belongs to this driver's cab, 
    // but following PHP logic exactly: UPDATE booking SET status=? WHERE booking_id=?
    await updateBookingStatus(Number(bookingId), newStatus);
    revalidatePath("/driver-dashboard");
  } catch (err) {
    console.error("Status update failed", err);
  }
}

export async function addDriverCab(formData: FormData) {
  const session = await getSession();

  if (!session.driverId) {
    redirect("/driver-login");
  }

  const cabNumber = (formData.get("cab_number") as string | null)?.trim().toUpperCase();
  const cabType = (formData.get("cab_type") as string | null)?.trim();
  const acType = (formData.get("ac_type") as string | null)?.trim();

  if (!cabNumber || !cabType || !acType) {
    redirect("/driver-dashboard?cab=missing");
  }

  if (acType !== "AC" && acType !== "Non-AC") {
    redirect("/driver-dashboard?cab=invalid");
  }

  try {
    const existingCab = await getCabByNumber(cabNumber);

    if (existingCab) {
      redirect("/driver-dashboard?cab=exists");
    }

    await createCabForDriver(cabNumber, cabType, acType, session.driverId);
    revalidatePath("/driver-dashboard");
  } catch (err) {
    console.error("Cab creation failed", err);
    redirect("/driver-dashboard?cab=error");
  }

  redirect("/driver-dashboard?cab=added");
}

export async function deleteDriverCab(formData: FormData) {
  const session = await getSession();

  if (!session.driverId) {
    redirect("/driver-login");
  }

  const cabIdRaw = formData.get("cab_id");
  const cabId = Number(cabIdRaw);

  if (!Number.isFinite(cabId)) {
    redirect("/driver-dashboard?cab=invalidDelete");
  }

  try {
    const hasBookings = await cabHasBookings(cabId);

    if (hasBookings) {
      redirect("/driver-dashboard?cab=inUse");
    }

    const deletedCab = await deleteCabByIdAndDriver(cabId, session.driverId);

    if (!deletedCab) {
      redirect("/driver-dashboard?cab=notFound");
    }

    revalidatePath("/driver-dashboard");
  } catch (err) {
    console.error("Cab deletion failed", err);
    redirect("/driver-dashboard?cab=deleteError");
  }

  redirect("/driver-dashboard?cab=deleted");
}
