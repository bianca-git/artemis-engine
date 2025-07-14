import "../styles/globals.css";

export const metadata = {
  title: "ARTEMIS",
  description: "Automated Real-Time Engagement & Marketing Intelligence System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-slate-300 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
