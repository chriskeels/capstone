// app/sign-in/[[...rest]]/page.tsx
// Clerk's catch-all sign-in route.

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50">
      <SignIn />
    </main>
  );
}
