import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { getCabsByDriver } from "@/lib/data/cabs";
import { getBookingsByDriver } from "@/lib/data/bookings";
import { getUsersByIds } from "@/lib/data/users";
import { addDriverCab, deleteDriverCab, updateTripStatus } from "./actions";

type DriverBookingRow = {
  booking_id: number;
  booking_date: string;
  booking_time: string | null;
  pickup_location: string | null;
  drop_location: string | null;
  status: string | null;
  cab_id: number | null;
  user_name: string | null;
  user_phone: string | null;
  cab_number: string | null;
  cab_type: string | null;
  ac_type: string | null;
};

export default async function DriverDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  noStore();

  const session = await getSession();
  if (!session.driverId) redirect("/driver-login");

  const resolvedParams = await searchParams;
  const cabStatusParam = typeof resolvedParams?.cab === "string" ? resolvedParams.cab : null;

  const cabStatusMessage = cabStatusParam === "added"
    ? { text: "Cab added successfully.", tone: "success" as const }
    : cabStatusParam === "deleted"
      ? { text: "Cab deleted successfully.", tone: "success" as const }
    : cabStatusParam === "exists"
      ? { text: "Cab number already exists.", tone: "error" as const }
      : cabStatusParam === "missing"
        ? { text: "Please fill all cab fields.", tone: "error" as const }
        : cabStatusParam === "invalid"
          ? { text: "Please choose a valid AC type.", tone: "error" as const }
          : cabStatusParam === "inUse"
            ? { text: "This cab cannot be deleted because bookings exist for it.", tone: "error" as const }
            : cabStatusParam === "notFound"
              ? { text: "Cab not found or you are not allowed to delete it.", tone: "error" as const }
              : cabStatusParam === "invalidDelete"
                ? { text: "Invalid cab selection for deletion.", tone: "error" as const }
                : cabStatusParam === "deleteError"
                  ? { text: "Unable to delete cab right now.", tone: "error" as const }
          : cabStatusParam === "error"
            ? { text: "Unable to add cab right now.", tone: "error" as const }
            : null;

  const cabRows = await getCabsByDriver(session.driverId);

  const cabMap = new Map<number, { cab_number: string | null; cab_type: string | null; ac_type: string | null }>();
  for (const cab of cabRows ?? []) {
    cabMap.set(cab.cab_id, {
      cab_number: cab.cab_number,
      cab_type: cab.cab_type,
      ac_type: cab.ac_type,
    });
  }

  const cabIds = [...cabMap.keys()];

  const bookingRows = await getBookingsByDriver(cabIds);

  const userIds = [...new Set((bookingRows ?? [])
    .map((booking) => booking.user_id)
    .filter((userId): userId is number => typeof userId === "number"))];

  const userMap = new Map<number, { name: string | null; phone: string | null }>();
  if (userIds.length > 0) {
    const users = await getUsersByIds(userIds);

    for (const user of users ?? []) {
      userMap.set(user.user_id, { name: user.name, phone: user.phone });
    }
  }

  const bookings: DriverBookingRow[] = (bookingRows ?? []).map((booking) => ({
    booking_id: booking.booking_id,
    booking_date: booking.booking_date,
    booking_time: booking.booking_time,
    pickup_location: booking.pickup_location,
    drop_location: booking.drop_location,
    status: booking.status,
    cab_id: booking.cab_id,
    user_name: booking.user_id ? userMap.get(booking.user_id)?.name ?? null : null,
    user_phone: booking.user_id ? userMap.get(booking.user_id)?.phone ?? null : null,
    cab_number: booking.cab_id ? cabMap.get(booking.cab_id)?.cab_number ?? null : null,
    cab_type: booking.cab_id ? cabMap.get(booking.cab_id)?.cab_type ?? null : null,
    ac_type: booking.cab_id ? cabMap.get(booking.cab_id)?.ac_type ?? null : null,
  }));

  const total = bookings.length;
  const picked = bookings.filter((booking) => booking.status === "Picked").length;
  const dropped = bookings.filter((booking) => booking.status === "Dropped").length;
  const confirmed = bookings.filter((booking) => booking.status === "Confirmed").length;

  return (
    <div className="flex-1 bg-transparent py-8 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Card */}
        <div className="glass-card p-10 relative overflow-hidden group z-20">
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold mb-2 text-slate-900 drop-shadow-sm">
              Welcome, <span className="text-emerald-600">{session.userName}</span>! 🚗
            </h1>
            <p className="text-slate-600 text-sm max-w-xl leading-relaxed font-light">
              Manage your assigned trips. Mark when you pick up and drop off users to keep them updated.
            </p>
          </div>

        </div>

        <div className="glass-card p-6 md:p-8 border-emerald-100">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Add Your Cab</h2>
              <p className="text-sm text-slate-600 mt-1">Create a cab and link it directly to your driver account.</p>
            </div>

            <div className="text-sm text-slate-600 md:text-right">
              <div className="font-semibold text-slate-800">Your Cabs: {cabRows.length}</div>
              <div className="text-xs mt-1">
                {cabRows.length > 0
                  ? cabRows.map((cab) => cab.cab_number).filter(Boolean).join(", ")
                  : "No cabs added yet"}
              </div>
            </div>
          </div>

          {cabStatusMessage && (
            <div className={`mt-5 text-sm py-3 px-4 rounded-xl border flex items-center gap-2 shadow-sm ${cabStatusMessage.tone === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
              }`}>
              <span>{cabStatusMessage.tone === "success" ? "✅" : "⚠️"}</span>
              {cabStatusMessage.text}
            </div>
          )}

          <form action={addDriverCab} className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              name="cab_number"
              placeholder="Cab Number (e.g. KL11AB1234)"
              required
              className="glass-input md:col-span-2"
            />

            <select name="cab_type" required className="glass-input">
              <option value="">Select Cab Type</option>
              <option value="Mini">Mini</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Premium">Premium</option>
            </select>

            <select name="ac_type" required className="glass-input">
              <option value="">AC Type</option>
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
            </select>

            <div className="md:col-span-4 flex justify-end">
              <button type="submit" className="neon-button-green px-6 py-2.5 text-sm whitespace-nowrap">
                Add Cab
              </button>
            </div>
          </form>

          {cabRows.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Manage Your Cabs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                {cabRows.map((cab) => (
                  <div key={cab.cab_id} className="rounded-xl p-4 border border-slate-200 flex items-center justify-between gap-4 bg-white/95 shadow-sm">
                    <div>
                      <div className="font-semibold text-slate-900">{cab.cab_number}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {cab.cab_type} | {cab.ac_type}
                      </div>
                    </div>

                    <form action={deleteDriverCab}>
                      <input type="hidden" name="cab_id" value={cab.cab_id} />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 flex flex-col items-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-emerald-300">
            <h2 className="text-4xl font-black text-slate-800 mb-2">{total}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Total Trips</p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-blue-300">
            <h2 className="text-4xl font-black text-blue-600 mb-2">{confirmed}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Pending Pickup</p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-amber-300">
            <h2 className="text-4xl font-black text-amber-600 mb-2">{picked}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Currently On Trip</p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center hover:-translate-y-1 transition-transform border-slate-200 hover:border-emerald-300">
            <h2 className="text-4xl font-black text-emerald-600 mb-2">{dropped}</h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">Completed Trips</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Your Assigned Bookings</h3>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-sm">
                    <th className="py-4 px-6 font-semibold tracking-wider">#</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">User Details</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Route</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Date & Time</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Cab</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Status</th>
                    <th className="py-4 px-6 font-semibold tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {bookings.map((row, i) => (
                    <tr key={row.booking_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-slate-500">{i + 1}</td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-900">{row.user_name || '-'}</div>
                        <div className="text-xs text-slate-500 mt-1">{row.user_phone || '-'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-700 max-w-[150px] truncate" title={row.pickup_location ?? undefined}>
                          <span className="text-xs text-slate-500 inline-block w-8">From:</span> {row.pickup_location}
                        </div>
                        <div className="text-slate-700 max-w-[150px] truncate mt-1" title={row.drop_location ?? undefined}>
                          <span className="text-xs text-slate-500 inline-block w-8">To:</span> {row.drop_location}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700">
                        <div className="font-medium text-slate-900">{new Date(row.booking_date).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500 mt-1">{row.booking_time || '-'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-900">{row.cab_number}</div>
                        <div className="text-xs text-slate-500 mt-1">({row.ac_type})</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-4 py-1.5 text-xs font-semibold rounded-full border shadow-sm
                          ${row.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                          ${row.status === 'Picked' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                          ${row.status === 'Dropped' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                          ${row.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''}
                        `}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {row.status === 'Confirmed' && (
                          <form action={updateTripStatus}>
                            <input type="hidden" name="booking_id" value={row.booking_id} />
                            <input type="hidden" name="new_status" value="Picked" />
                            <button type="submit" className="text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-200 hover:border-amber-300 px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-sm w-full text-center">
                              🚗 Mark Picked
                            </button>
                          </form>
                        )}
                        {row.status === 'Picked' && (
                          <form action={updateTripStatus}>
                            <input type="hidden" name="booking_id" value={row.booking_id} />
                            <input type="hidden" name="new_status" value="Dropped" />
                            <button type="submit" className="text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-200 hover:border-emerald-300 px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-sm w-full text-center">
                              📍 Mark Dropped
                            </button>
                          </form>
                        )}
                        {row.status === 'Dropped' && (
                          <span className="text-emerald-600 text-xs font-bold flex items-center justify-center py-1.5">
                            ✅ Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-24 px-6">
              <div className="text-6xl mb-6 opacity-40">📂</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No trips assigned</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto font-light">You currently have no bookings assigned to your cab. Check back later.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
