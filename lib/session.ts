import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import { randomUUID } from "crypto";

export interface VisitorSessionData {
  visitorId?: string;
  lastDisplayName?: string;
}

export interface AdminSessionData {
  isAdmin?: boolean;
}

function requireSecret(): string {
  const secret = process.env.COOKIE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "COOKIE_SECRET env var must be set and at least 32 characters long"
    );
  }
  return secret;
}

const visitorSessionOptions: SessionOptions = {
  password: "",
  cookieName: "visitor_id",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  },
};

const adminSessionOptions: SessionOptions = {
  password: "",
  cookieName: "admin_session",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getVisitorSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<VisitorSessionData>(cookieStore, {
    ...visitorSessionOptions,
    password: requireSecret(),
  });
  return session;
}

// Ensures a visitor_id exists, creating one if missing. Call from a Server
// Component or Route Handler that can write cookies (e.g. middleware-adjacent
// code); Server Components can only read, so this also works via middleware.
export async function ensureVisitorId(): Promise<string> {
  const session = await getVisitorSession();
  if (!session.visitorId) {
    session.visitorId = randomUUID();
    await session.save();
  }
  return session.visitorId;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<AdminSessionData>(cookieStore, {
    ...adminSessionOptions,
    password: requireSecret(),
  });
  return session;
}

// No ADMIN_PASSWORD configured yet means there's nothing to gate against —
// treat admin as open so it can be built/tested before a real password exists.
export function isAdminAuthRequired(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!isAdminAuthRequired()) return true;
  const session = await getAdminSession();
  return session.isAdmin === true;
}
