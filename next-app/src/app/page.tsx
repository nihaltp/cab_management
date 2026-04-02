import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const features = [
    {
      name: "AC and Non-AC",
      desc: "Pick rides based on comfort and weather in one tap.",
      icon: "❄️",
    },
    {
      name: "Multiple Cab Types",
      desc: "Mini, Sedan, SUV, and Premium options for every trip size.",
      icon: "🚗",
    },
    {
      name: "Live Trip Status",
      desc: "Track every ride stage from Confirmed to Dropped.",
      icon: "📍",
    },
    {
      name: "Easy Booking",
      desc: "Book, reschedule, or cancel quickly without long forms.",
      icon: "✏️",
    },
    {
      name: "Always Available",
      desc: "Reliable service throughout the day and night.",
      icon: "⏰",
    },
    {
      name: "Verified Drivers",
      desc: "Driver details are visible in your dashboard for each booking.",
      icon: "🛡️",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] overflow-hidden pb-16">
      <section className="px-6 pt-14 pb-12 lg:px-8">
        <div className="mx-auto max-w-6xl glass-card p-8 sm:p-12 md:p-14 rounded-3xl border border-cyan-100/70 relative overflow-hidden">
          <div className="absolute -top-24 -right-12 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-8 h-52 w-52 rounded-full bg-sky-400/20 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
            <div className="text-center lg:text-left">
              <span className="hero-chip hero-enter">
              Announcing our new robust cab management portal.
              </span>
              <h1 className="hero-enter-delay mt-6 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                Book your cab faster,
                <span className="block text-cyan-700">travel smarter.</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg leading-8 text-slate-600 max-w-2xl mx-auto lg:mx-0">
                A clean and reliable booking experience for users, drivers, and admins.
                Plan rides, monitor status, and manage everything from one robust portal.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                {!user ? (
                  <>
                    <Link href="/register" className="neon-button px-8 py-3 text-base">
                      Get Started
                    </Link>
                    <Link href="/login" className="neon-button-green px-8 py-3 text-base">
                      Book Now
                    </Link>
                  </>
                ) : (
                    <>
                      <Link href="/dashboard" className="neon-button px-8 py-3 text-base">
                        Go to Dashboard
                      </Link>
                      <Link href="/booking" className="glass-panel px-8 py-3 rounded-xl font-semibold text-slate-700 hover:text-cyan-700 transition-colors">
                        Book Now
                      </Link>
                    </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              <div className="glass-panel rounded-2xl p-5 text-left">
                <p className="text-sm text-slate-500">Average booking</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">under 60s</p>
              </div>
              <div className="glass-panel rounded-2xl p-5 text-left">
                <p className="text-sm text-slate-500">Service</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">24/7</p>
              </div>
              <div className="glass-panel rounded-2xl p-5 text-left col-span-2">
                <p className="text-sm text-slate-500">Supported ride categories</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">Mini, Sedan, SUV, Premium</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl mb-10 text-center md:text-left">
            <h2 className="text-sm font-bold leading-7 text-cyan-700 tracking-[0.2em] uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Everything needed for smooth rides
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div key={i} className="feature-tile group">
                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 text-2xl mb-4 border border-cyan-100 group-hover:scale-105 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feature.name}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-7">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Login Portals
            </h2>
            <p className="mt-3 text-slate-600">
              Dedicated spaces for riders, drivers, and admins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-8 text-center flex flex-col">
              <div className="text-5xl mb-5">👤</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">User</h3>
              <p className="text-slate-500 mb-8 h-12 text-sm">
                Book cabs, track trips and manage your bookings
              </p>
              <Link
                href="/login"
                className="mt-auto neon-button py-3 text-sm flex justify-center items-center gap-2"
              >
                <span>Enter Portal</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            <div className="glass-card p-8 text-center flex flex-col border-emerald-100/80 hover:border-emerald-300">
              <div className="text-5xl mb-5">🚕</div>
              <h3 className="text-2xl font-bold mb-3 text-emerald-700">Driver</h3>
              <p className="text-slate-500 mb-8 h-12 text-sm">
                View assigned trips and update pickup and drop status
              </p>
              <Link
                href="/driver-login"
                className="mt-auto neon-button-green py-3 text-sm flex justify-center items-center gap-2"
              >
                <span>Enter Portal</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            <div className="glass-card p-8 text-center flex flex-col border-rose-100/80 hover:border-rose-300">
              <div className="text-5xl mb-5">🔐</div>
              <h3 className="text-2xl font-bold mb-3 text-rose-600">Admin</h3>
              <p className="text-slate-500 mb-8 h-12 text-sm">
                Manage all users, drivers, cabs and bookings
              </p>
              <Link
                href="/admin-login"
                className="mt-auto neon-button-red py-3 text-sm flex justify-center items-center gap-2"
              >
                <span>Enter Portal</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
