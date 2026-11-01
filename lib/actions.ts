"use server";

import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { check, hash } from "@/lib/auth";
import { redirect } from "next/navigation";

type Role = "admin" | "user";

async function start(id: number, role: Role) {
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
  const u = await prisma.user.findUnique({ where: { email }, select: { id: true, pass: true, role: true } });
  if (!u || !check(pass, u.pass)) redirect("/Login?err=1");
  await start(u.id, u.role);
  redirect(u.role === "admin" ? "/Dashboard" : "/");
}

export async function register(fd: FormData) {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const pass = String(fd.get("password") ?? "");
  if (!/^\S+@\S+\.\S+$/.test(email) || pass.length < 6) redirect("/Register?err=invalid");
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) redirect("/Register?err=exists");
  const r = await prisma.user.create({ data: { email, pass: hash(pass), role: "user" } });
  await start(r.id, "user");
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
  const q = Math.min(Math.max(Math.trunc(Number(fd.get("qty"))) || 1, 1), 20);
  if (!id || !(await prisma.menu.findFirst({ where: { id, avail: true }, select: { id: true } }))) return;
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
  if (!ids.length) redirect("/Payment");

  const type = String(fd.get("type") ?? "");
  const tbl = String(fd.get("tbl") ?? "").trim().slice(0, 10);
  const method = String(fd.get("method") ?? "");
  const note = String(fd.get("note") ?? "").trim().slice(0, 200);
  if (!["dine_in", "takeaway"].includes(type)) redirect("/Payment?err=type");
  if (type === "dine_in" && !tbl) redirect("/Payment?err=tbl");
  if (!["cash", "qris", "transfer"].includes(method)) redirect("/Payment?err=method");

  const rows = await prisma.menu.findMany({ where: { avail: true, id: { in: ids } }, select: { id: true, price: true } });
  if (rows.length !== ids.length) redirect("/Payment?err=menu");

  const total = rows.reduce((t, r) => t + r.price * c[r.id], 0);
  const o = await prisma.order.create({
    data: {
      userId: Number(s.userId),
      type: type as "dine_in" | "takeaway",
      tbl: type === "dine_in" ? tbl : null,
      total,
      note,
      items: { create: rows.map((r) => ({ menuId: r.id, qty: c[r.id], price: r.price })) },
      payment: { create: { method: method as "cash" | "qris" | "transfer", amount: total } },
    },
  });
  const oid = o.id;

  s.cart = {};
  await s.save();
  redirect(`/Payment?order=${oid}`);
}
