import "./globals.css";
import Head from "next/head";

export const metadata = {
  title: "ARTEMIS",
  description: "Automated Real-Time Engagement & Marketing Intelligence System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        {/* Google Identity Services script */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </Head>
      <body className="bg-base-100 min-h-screen p-0 m-0 mx-auto">
        {children}
      </body>
    </html>
  );
}
export const dynamic = "force-dynamic"; // Ensures the layout is always re-rendered
export const revalidate = 0; // Disables static generation for this layout
