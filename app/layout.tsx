import "./globals.css";

export const metadata = {
  title: "ARTEMIS",
  description: "Automated Real-Time Engagement & Marketing Intelligence System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Identity Services script */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body className="bg-gray-900 text-slate-300 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
