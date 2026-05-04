// app/api/webhooks/clerk/route.ts
// Listens for Clerk user events and keeps your Neon DB in sync.
// Handles: user.created, user.updated, user.deleted

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "../../../../lib/prisma";

type ClerkUserEvent = {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses: { email_address: string; id: string }[];
    primary_email_address_id: string;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
};

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  // Verify the webhook signature using svix
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: ClerkUserEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  // Helper: resolve the primary email address
  const getPrimaryEmail = () => {
    const primary = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id
    );
    return primary?.email_address ?? data.email_addresses[0]?.email_address ?? "";
  };

  try {
    switch (type) {
      case "user.created": {
        await prisma.user.create({
          data: {
            clerkId: data.id,
            email: getPrimaryEmail(),
            name: [data.first_name, data.last_name].filter(Boolean).join(" ") || null,
            avatarUrl: data.image_url,
          },
        });
        console.log(`[Clerk Webhook] Created user: ${data.id}`);
        break;
      }

      case "user.updated": {
        await prisma.user.update({
          where: { clerkId: data.id },
          data: {
            email: getPrimaryEmail(),
            name: [data.first_name, data.last_name].filter(Boolean).join(" ") || null,
            avatarUrl: data.image_url,
          },
        });
        console.log(`[Clerk Webhook] Updated user: ${data.id}`);
        break;
      }

      case "user.deleted": {
        await prisma.user.delete({
          where: { clerkId: data.id },
        });
        console.log(`[Clerk Webhook] Deleted user: ${data.id}`);
        break;
      }

      default:
        console.log(`[Clerk Webhook] Unhandled event type: ${type}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error(`[Clerk Webhook] Database error for event ${type}:`, err);
    return NextResponse.json({ error: "Database operation failed" }, { status: 500 });
  }
}
