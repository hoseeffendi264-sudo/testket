import "server-only";
import { getIronSession } from "iron-session";
import { connection } from "next/server";
import { cookies } from "next/headers";

export type UserRole = "admin" | "user";

export interface SessionData {
  isLoggedIn: boolean;
  userId?: string;
  role?: UserRole;
  cart?: Record<string, number>;
}

export async function getSession() {
  await connection();
  return getIronSession<SessionData>(await cookies(), {
    cookieName: "kn-session",
    password: process.env.SESSION_PASSWORD!,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  });
}
