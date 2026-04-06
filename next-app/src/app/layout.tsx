import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { checkDatabaseConnection } from "@/lib/data/users";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cab Management System",
  description: "Modern cab management portal.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let dbError: string | null = null;
  try {
    const error = await checkDatabaseConnection();

    if (error) {
      dbError = error.message;
    }
  } catch (error: unknown) {
    dbError = error instanceof Error ? error.message : "Unknown error";
  }

  if (dbError) {
    const timestamp = new Date().toLocaleString();
    const bodyContent = `Error Details: ${dbError}\n\nTime: ${timestamp}`;
    const githubUsername = process.env.GITHUB_USERNAME || "nihaltp";
    const githubRepo = process.env.GITHUB_REPO || "cab_management";
    const issueUrl = `https://github.com/${githubUsername}/${githubRepo}/issues/new?title=Database+Connection+Error&body=${encodeURIComponent(bodyContent)}`;
    return (
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body
          className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 p-4"
          suppressHydrationWarning={true}
        >
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-red-200 max-w-xl w-full text-center">
            <h1 className="text-3xl font-bold mb-4 text-red-600">Database Connection Error</h1>
            <p className="mb-6 text-slate-600">The application could not connect to the database. The system returned the following error code:</p>
            <div className="bg-red-50 py-3 px-4 rounded-lg mb-8 text-center overflow-x-auto border border-red-100 flex flex-col gap-2">
              <code className="text-red-700 font-mono font-medium text-lg break-all">{dbError}</code>
              <span className="text-red-500 text-sm font-medium">{timestamp}</span>
            </div>
            <a 
              href={issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center bg-slate-900 hover:bg-slate-800 focus:ring-4 focus:ring-slate-300 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 w-full sm:w-auto"
            >
              Report Issue
            </a>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-screen flex flex-col text-slate-800 bg-slate-50"
        suppressHydrationWarning={true}
      >
        <Navbar />
        <main className="flex-1 drop-shadow-sm relative z-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
