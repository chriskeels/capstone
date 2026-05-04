// app/layout.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Get Up & Glo",
  description: "Intentional self-care rituals, hand-poured for you.",
};

function Footer() {
  return (
    <footer className="border-t border-ash px-8 py-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <p className="font-serif text-base tracking-[0.12em] text-gold uppercase">
          Get Up &amp; Glo
        </p>
        <p className="text-[12px] text-dusk">
          Intentional self-care, hand-poured for you.
        </p>
        <div className="flex gap-8">
          <div className="flex gap-4">
            <Link
              href="https://www.facebook.com/getupnglocandles"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-dusk text-dusk hover:border-gold hover:text-gold transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </Link>
          </div>
          <div className="flex gap-6">
            <Link href="/products" className="text-[12px] text-dusk hover:text-fog transition-colors">
              Collection
            </Link>
            <Link href="/rituals/new" className="text-[12px] text-dusk hover:text-fog transition-colors">
              Rituals
            </Link>
            <Link href="/sign-up" className="text-[12px] text-dusk hover:text-fog transition-colors">
              Join
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-bark text-cream antialiased min-h-screen">
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
