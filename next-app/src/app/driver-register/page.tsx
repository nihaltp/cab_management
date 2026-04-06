import Link from "next/link";
import { registerDriver } from "./actions";

export default async function DriverRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const error =
    resolvedParams?.error === "EmailExists"
      ? "This email is already registered as a driver."
      : resolvedParams?.error === "MissingFields"
        ? "Please fill in all required fields."
        : resolvedParams?.error === "Error"
          ? "Unable to register driver right now. Please try again."
          : null;

  return (
    <div className="flex justify-center items-center py-20 px-4 min-h-[calc(100vh-80px)]">
      <div className="glass-card p-10 w-full max-w-md border-emerald-100">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🪪</div>
          <h2 className="text-2xl font-bold text-slate-900">Driver Registration</h2>
          <p className="text-slate-600 text-sm mt-1">Create your driver portal account</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 text-sm py-3 px-4 rounded-xl border border-rose-200 mb-6 flex items-center gap-2 shadow-sm">
            <span>⚠️</span> {error}
          </div>
        )}

        <form action={registerDriver} className="space-y-5">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              className="glass-input focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          <div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              required
              className="glass-input focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          <div>
            <input
              type="text"
              name="licenseNo"
              placeholder="License Number"
              required
              className="glass-input focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              className="glass-input focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="glass-input focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          <button type="submit" className="w-full neon-button-green mt-4">
            <span className="group-hover:tracking-wide transition-all">Register as Driver</span>
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-600">
          Already have a driver account?{" "}
          <Link href="/driver-login" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
