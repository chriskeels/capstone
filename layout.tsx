// app/layout.tsx

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Get Up & Glo",
  description: "Intentional self-care rituals, hand-poured for you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-cream text-bark antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
