"use server";

import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { check, hash } from "@/lib/auth";
import { redirect } from "next/navigation";

async function start(id: number, role: "admin" | "user") {
  const s = await getSession();
  s.userId = String(id);
  s.role = role;
  s.isLoggedIn = true;
  s.cart = {};
  await s.save();
}

async function need() {
  const s = await getSession();
  if (!s.isLoggedIn || !s.userId) redirect("/Login");
  return s;
}

export async function login(fd: FormData) {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const pass = String(fd.get("password") ?? "");

  const u = await prisma.user.findUnique({ where: { email } });
  if (!u || !check(pass, u.pass)) redirect("/Login?err=1");

  await start(u.id, u.role);
  if (u.role === "admin") redirect("/Dashboard");
  redirect("/");
}

export async function register(fd: FormData) {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const pass = String(fd.get("password") ?? "");

  if (!/^\S+@\S+\.\S+$/.test(email) || pass.length < 6) redirect("/Register?err=invalid");

  const ada = await prisma.user.findUnique({ where: { email } });
  if (ada) redirect("/Register?err=exists");

  const u = await prisma.user.create({ data: { email, pass: hash(pass), role: "user" } });
  await start(u.id, "user");
  redirect("/");
}

export async function logout() {
  const session = await getSession();
  if (session.isLoggedIn) {
    session.destroy();
  }
  redirect("/Login");
}

export async function addToCart(fd: FormData) {
  const s = await need();
  const id = Number(fd.get("id"));
  let q = Math.trunc(Number(fd.get("qty"))) || 1;
  if (q < 1) q = 1;
  if (q > 20) q = 20;
  if (!id) return;

  const m = await prisma.menu.findFirst({ where: { id, avail: true } });
  if (!m) return;

  const c = { ...(s.cart ?? {}) };
  c[id] = Math.min((c[id] ?? 0) + q, 50);
  s.cart = c;
  await s.save();
}

export async function cartOp(fd: FormData) {
  const s = await need();
  const id = String(fd.get("id"));
  const op = String(fd.get("op"));
  const c = { ...(s.cart ?? {}) };
  if (!(id in c)) return;

  if (op === "inc") c[id] = Math.min(c[id] + 1, 50);
  else if (op === "dec") c[id] -= 1;
  else if (op === "del") c[id] = 0;

  if (c[id] <= 0) delete c[id];
  s.cart = c;
  await s.save();
}

export async function placeOrder(fd: FormData) {
  const s = await need();
  const c = s.cart ?? {};
  const ids = Object.keys(c).map(Number);
  if (ids.length === 0) redirect("/Payment");

  const t = String(fd.get("type") ?? "");
  const m = String(fd.get("method") ?? "");
  const tbl = String(fd.get("tbl") ?? "").trim().slice(0, 10);
  const note = String(fd.get("note") ?? "").trim().slice(0, 200);

  let type: "dine_in" | "takeaway";
  if (t === "dine_in") type = "dine_in";
  else if (t === "takeaway") type = "takeaway";
  else redirect("/Payment?err=type");
  if (type === "dine_in" && !tbl) redirect("/Payment?err=tbl");

  let method: "cash" | "qris" | "transfer";
  if (m === "cash") method = "cash";
  else if (m === "qris") method = "qris";
  else if (m === "transfer") method = "transfer";
  else redirect("/Payment?err=method");

  const menus = await prisma.menu.findMany({ where: { id: { in: ids }, avail: true } });
  if (menus.length !== ids.length) redirect("/Payment?err=menu");

  let total = 0;
  const items = [];
  for (const mn of menus) {
    total += mn.price * c[mn.id];
    items.push({ menuId: mn.id, qty: c[mn.id], price: mn.price });
  }

  const o = await prisma.order.create({
    data: {
      userId: Number(s.userId),
      type,
      tbl: type === "dine_in" ? tbl : null,
      total,
      note,
      items: { create: items },
      payment: { create: { method, amount: total } },
    },
  });

  s.cart = {};
  await s.save();
  redirect("/Payment?order=" + o.id);
}
