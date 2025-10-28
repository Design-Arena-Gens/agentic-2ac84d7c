import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Music Distribution Dashboard",
  description: "Upload and distribute your music to major streaming platforms",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
