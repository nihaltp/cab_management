import { getSupabaseAdminClient } from "../supabase-admin";

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
