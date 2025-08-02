import "./globals.css";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: "A.R.T.E.M.I.S",
  description: "Automated Real-Time Engagement & Marketing Intelligence System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        {/* Google Identity Services script */}
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Bianca Wilkinson" />
        <meta name="robots" content="noindex, nofollow" />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </Head>
      <body className="bg-base-100 min-h-screen p-0 m-0 mx-auto">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
export const dynamic = "force-dynamic"; // Ensures the layout is always re-rendered
export const revalidate = 0; // Disables static generation for this layout
