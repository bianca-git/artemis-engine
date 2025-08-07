import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: "A.R.T.E.M.I.S",
  description: "Automated Real-Time Engagement & Marketing Intelligence System",
  icons: {
    icon: "/favicon.ico"
  },
  authors: [{ name: "Bianca Wilkinson" }],
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-base-100 min-h-screen p-0 m-0 mx-auto">
        {/* Google Identity Services script */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          async
          defer
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
export const dynamic = "force-dynamic"; // Ensures the layout is always re-rendered
export const revalidate = 0; // Disables static generation for this layout

/**
 * Provides viewport config using Next.js generateViewport API
 */
export function generateViewport() {
  return { width: 'device-width', initialScale: 1 };
}
