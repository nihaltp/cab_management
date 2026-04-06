import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getBookingCount } from "@/lib/data/bookings";
import { getAllBookings } from "@/lib/data/detailed_bookings";
import { getUserCount, getUsersByIds } from "@/lib/data/users";
import { getUserRegistrationLogs } from "@/lib/data/user_registration_logs";
import { getCabsByIds, getCabCount } from "@/lib/data/cabs";
import { getDriversByIds, getDriverCount } from "@/lib/data/drivers";
import { updateAdminTripStatus } from "./actions";

type AdminBookingRow = {
  booking_id: number;
  booking_date: string;
  booking_time: string | null;
  pickup_location: string | null;
  drop_location: string | null;
  status: string | null;
  user_name: string | null;
  user_phone: string | null;
  email: string | null;
  cab_number: string | null;
  cab_type: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  license_no: string | null;
};

type UserRegistrationLog = {
  log_id: number;
  user_id: number;
  registered_name: string | null;
  registered_email: string | null;
  registration_timestamp: string;
};

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session.adminId) redirect("/admin-login");

  const [userCount, bookingCount, cabCount, driverCount, registrationLogs] = await Promise.all([
    getUserCount(),
    getBookingCount(),
    getCabCount(),
    getDriverCount(),
    getUserRegistrationLogs(25),
  ]);

  const bookingRows = await getAllBookings();

  const userIds = [...new Set((bookingRows ?? [])
    .map((booking) => booking.user_id)
    .filter((userId): userId is number => typeof userId === "number"))];
  const cabIds = [...new Set((bookingRows ?? [])
    .map((booking) => booking.cab_id)
    .filter((cabId): cabId is number => typeof cabId === "number"))];

  const userMap = new Map<number, { name: string | null; phone: string | null; email: string | null }>();
  const cabMap = new Map<number, { cab_number: string | null; cab_type: string | null; driver_id: number | null }>();
  const driverMap = new Map<number, { name: string | null; phone: string | null; license_no: string | null }>();

  if (userIds.length > 0) {
    const users = await getUsersByIds(userIds);

    for (const user of users ?? []) {
      userMap.set(user.user_id, { name: user.name, phone: user.phone, email: user.email });
    }
  }

  if (cabIds.length > 0) {
    const cabs = await getCabsByIds(cabIds);

    for (const cab of cabs ?? []) {
      cabMap.set(cab.cab_id, { cab_number: cab.cab_number, cab_type: cab.cab_type, driver_id: cab.driver_id });
    }

    const driverIds = [...new Set((cabs ?? [])
      .map((cab) => cab.driver_id)
      .filter((driverId): driverId is number => typeof driverId === "number"))];

    if (driverIds.length > 0) {
      const drivers = await getDriversByIds(driverIds);

      for (const driver of drivers ?? []) {
        driverMap.set(driver.driver_id, {
          name: driver.name,
          phone: driver.phone,
          license_no: driver.license_no,
        });
      }
    }
  }

  const bookings: AdminBookingRow[] = (bookingRows ?? []).map((booking) => {
    const user = booking.user_id ? userMap.get(booking.user_id) : null;
    const cab = booking.cab_id ? cabMap.get(booking.cab_id) : null;
    const driver = cab?.driver_id ? driverMap.get(cab.driver_id) : null;

    return {
      booking_id: booking.booking_id,
      booking_date: booking.booking_date,
      booking_time: booking.booking_time,
      pickup_location: booking.pickup_location,
      drop_location: booking.drop_location,
      status: booking.status,
      user_name: user?.name ?? null,
      user_phone: user?.phone ?? null,
      email: user?.email ?? null,
      cab_number: cab?.cab_number ?? null,
      cab_type: cab?.cab_type ?? null,
      driver_name: driver?.name ?? null,
      driver_phone: driver?.phone ?? null,
      license_no: driver?.license_no ?? null,
    };
  });

  const userRegistrationLogs: UserRegistrationLog[] = registrationLogs;

  return (
    <div className="flex-1 bg-transparent py-8 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Welcome Card */}
        <div className="glass-card p-10 relative overflow-hidden group">
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold mb-2 text-slate-900 drop-shadow-sm">
              <span className="text-rose-600">Admin</span> Control Panel ⚙️
            </h1>
            <p className="text-slate-600 text-sm max-w-xl leading-relaxed font-light">
              View and manage all system data including bookings, users, drivers, and cabs across the organization.
            </p>
          </div>

        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 flex flex-col items-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-blue-300">
            <h2 className="text-4xl font-black text-slate-800 mb-2">{userCount || 0}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Total Users</p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-indigo-300">
            <h2 className="text-4xl font-black text-indigo-600 mb-2">{bookingCount || 0}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Total Bookings</p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-violet-300">
            <h2 className="text-4xl font-black text-violet-600 mb-2">{cabCount || 0}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Total Cabs</p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-rose-300">
            <h2 className="text-4xl font-black text-rose-600 mb-2">{driverCount || 0}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Total Drivers</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">System Bookings Record</h3>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Recent User Registrations</h3>
        </div>

        <div className="glass-card overflow-hidden">
          {userRegistrationLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="py-4 px-4 font-semibold">Log ID</th>
                    <th className="py-4 px-4 font-semibold">User ID</th>
                    <th className="py-4 px-4 font-semibold">Name</th>
                    <th className="py-4 px-4 font-semibold">Email</th>
                    <th className="py-4 px-4 font-semibold">Registered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {userRegistrationLogs.map((row) => (
                    <tr key={row.log_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 text-slate-600 font-medium">{row.log_id}</td>
                      <td className="py-4 px-4 text-slate-700">{row.user_id}</td>
                      <td className="py-4 px-4 text-slate-900 font-medium">{row.registered_name || "-"}</td>
                      <td className="py-4 px-4 text-slate-700">{row.registered_email || "-"}</td>
                      <td className="py-4 px-4 text-slate-600">{new Date(row.registration_timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 px-6">
              <p className="text-slate-500 text-sm">No user registrations logged yet.</p>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="py-4 px-4 font-semibold">#</th>
                    <th className="py-4 px-4 font-semibold">User Details</th>
                    <th className="py-4 px-4 font-semibold">Trip Route</th>
                    <th className="py-4 px-4 font-semibold">Schedule</th>
                    <th className="py-4 px-4 font-semibold">Cab details</th>
                    <th className="py-4 px-4 font-semibold">Driver Details</th>
                    <th className="py-4 px-4 font-semibold">Status</th>
                    <th className="py-4 px-4 font-semibold">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {bookings.map((row, i) => (
                    <tr key={row.booking_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 text-slate-500 font-medium">{i + 1}</td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 tracking-wide">{row.user_name || '-'}</div>
                        <div className="text-xs text-slate-600 mt-1 flex flex-col gap-0.5">
                          <span>{row.user_phone || '-'}</span>
                          <span className="text-slate-500">{row.email || '-'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-slate-700 max-w-[200px] truncate" title={row.pickup_location ?? undefined}>
                          <span className="text-xs text-slate-500 inline-block w-10">Origin:</span> <span className="font-medium text-slate-800">{row.pickup_location}</span>
                        </div>
                        <div className="text-slate-700 max-w-[200px] truncate mt-1.5" title={row.drop_location ?? undefined}>
                          <span className="text-xs text-slate-500 inline-block w-10">Dest:</span> <span className="font-medium text-slate-800">{row.drop_location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-700">
                        <div className="font-medium">{new Date(row.booking_date).toLocaleDateString()}</div>
                        <div className="text-xs px-2 py-0.5 mt-1 bg-slate-100 rounded-md inline-block text-slate-600 border border-slate-200">{row.booking_time || '-'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold tracking-wide text-slate-900">{row.cab_number || '-'}</div>
                        <div className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block mt-1">{row.cab_type || '-'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900">{row.driver_name || 'Unassigned'}</div>
                        <div className="text-xs text-slate-600 mt-1">{row.driver_phone || '-'}</div>
                        <div className="text-[10px] text-slate-500 tracking-widest mt-0.5">{row.license_no || ''}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-4 py-1.5 text-xs font-bold rounded-full shadow-sm border
                          ${row.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                          ${row.status === 'Picked' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                          ${row.status === 'Dropped' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                          ${row.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''}
                        `}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {row.status === 'Confirmed' && (
                          <form action={updateAdminTripStatus} className="inline-block w-full">
                            <input type="hidden" name="booking_id" value={row.booking_id} />
                            <input type="hidden" name="new_status" value="Picked" />
                            <button type="submit" className="text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-200 hover:border-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm w-full text-center">
                              Override: Picked
                            </button>
                          </form>
                        )}
                        {row.status === 'Picked' && (
                          <form action={updateAdminTripStatus} className="inline-block w-full">
                            <input type="hidden" name="booking_id" value={row.booking_id} />
                            <input type="hidden" name="new_status" value="Dropped" />
                            <button type="submit" className="text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm w-full text-center mt-1">
                              Override: Dropped
                            </button>
                          </form>
                        )}
                        {(row.status === 'Dropped' || row.status === 'Cancelled') && (
                          <span className="text-slate-500 text-xs italic">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-24 px-6">
              <div className="text-6xl mb-6 opacity-40">📭</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings in the system</h3>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
