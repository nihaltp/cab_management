import { getSupabaseAdminClient } from "../supabase-admin";
import { clientPromise } from "../mongodb";

export async function createBooking(
  userId: number,
  cabId: number,
  pickupLocation: string,
  dropLocation: string,
  bookingDate: string,
  bookingTime: string
) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("booking").insert({
    user_id: userId,
    cab_id: cabId,
    pickup_location: pickupLocation,
    drop_location: dropLocation,
    booking_date: bookingDate,
    booking_time: bookingTime,
    status: "Confirmed",
  });

  if (error) {
    throw error;
  }
}

export async function updateBookingStatus(bookingId: number, newStatus: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("booking")
    .update({ status: newStatus })
    .eq("booking_id", bookingId);

  if (error) {
    throw error;
  }
}

export async function cancelBooking(bookingId: number, userId: number) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("booking")
    .update({ status: "Cancelled" })
    .eq("booking_id", bookingId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function getBookingsByUserId(userId: number) {
  const client = await clientPromise;
  const db = client.db();

  const bookingDocs = await db
    .collection("bookings")
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return bookingDocs.map((booking) => ({
    booking_id: String(booking._id),
    booking_date: typeof booking.booking_date === "string" ? booking.booking_date : "",
    booking_time: typeof booking.booking_time === "string" ? booking.booking_time : null,
    pickup_location:
      typeof booking.pickup_location === "string" ? booking.pickup_location : null,
    drop_location:
      typeof booking.drop_location === "string" ? booking.drop_location : null,
    status: typeof booking.status === "string" ? booking.status : null,
    cab_id: typeof booking.cabId === "number"
      ? booking.cabId
      : typeof booking.cab_id === "number"
        ? booking.cab_id
        : null,
  }));
}

export async function getAllBookings() {
  const supabase = getSupabaseAdminClient();
  const { data: bookingRows, error } = await supabase
    .from("detailed_bookings")
    .select("booking_id, booking_date, booking_time, pickup_location, drop_location, status, user_id, cab_id, user_name, user_phone, email, cab_number, cab_type, driver_name, driver_phone, license_no")
    .order("booking_date", { ascending: false })
    .order("booking_time", { ascending: false });

  if (error) {
    throw error;
  }

  return bookingRows || [];
}

export async function getBookingsByDriver(cabIds: number[]) {
  if (cabIds.length === 0) return [];

  const supabase = getSupabaseAdminClient();
  const { data: bookingRows, error } = await supabase
    .from("booking")
    .select("booking_id, booking_date, booking_time, pickup_location, drop_location, status, user_id, cab_id")
    .in("cab_id", cabIds)
    .neq("status", "Cancelled")
    .order("booking_date", { ascending: false })
    .order("booking_time", { ascending: false });

  if (error) {
    throw error;
  }

  return bookingRows || [];
}

export async function getBookingCount() {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("booking")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return count;
}
