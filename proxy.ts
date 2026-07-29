import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import type { VisitorSessionData } from "@/lib/session";

export const config = {
  matcher: ["/p/:path*", "/api/plans/:path*", "/api/events"],
};

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const secret = process.env.COOKIE_SECRET;
  if (!secret || secret.length < 32) {
    return response;
  }

  const session = await getIronSession<VisitorSessionData>(request, response, {
    password: secret,
    cookieName: "visitor_id",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    },
  });

  if (!session.visitorId) {
    session.visitorId = crypto.randomUUID();
    await session.save();
  }

  return response;
}
