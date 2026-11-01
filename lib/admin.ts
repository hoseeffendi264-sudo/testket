import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "./session";

export async function needAdmin() {
  const s = await getSession();
  if (!s.isLoggedIn || s.role !== "admin") redirect("/Login");
}
