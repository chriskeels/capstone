// components/Navbar.tsx
// Shared navigation bar — used across all pages.

"use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";

export default function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <nav className="flex items-center justify-between px-8 md:px-12 py-6 border-b border-ash">
      {/* Brand */}
      <Link
        href="/"
        className="font-serif text-lg tracking-[0.12em] uppercase no-underline focus:outline-none"
        style={{ color: "#C9A87A" }}
      >
        Get Up &amp; Glo
      </Link>

      {/* Links */}
      <div className="hidden md:flex items-center gap-8">
        <Link href="/products" className="nav-link">Collection</Link>
        <Link href="/rituals/new" className="nav-link">Rituals</Link>
        <Link href="/#about" className="nav-link">About</Link>
      </div>

      {/* Auth */}
      <div className="flex items-center gap-4">
        {!isSignedIn ? (
          <Link href="/sign-in" className="btn-primary text-sm py-2.5 px-5">
            Sign in
          </Link>
        ) : (
          <>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 ring-1 ring-ash",
                },
              }}
            />
          </>
        )}
      </div>
    </nav>
  );
}
