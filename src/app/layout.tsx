import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Squad Aim Trainer",
  description: "3D aim trainer for Squad players. Train, climb the leaderboard, beat your clan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-white antialiased min-h-screen">{children}</body>
    </html>
  );
}
