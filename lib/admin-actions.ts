"use server";

import { prisma } from "@/lib/db";
import { needAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import type { OrderStatus, PayStatus } from "@/lib/generated/prisma/client";

const ST = ["pending", "cooking", "ready", "done", "cancelled"];
const PS = ["unpaid", "paid", "failed"];
const EXT = ["jpg", "jpeg", "png", "webp"];

function back(fd: FormData, def: string) {
  const b = String(fd.get("back") ?? "");
  return b.startsWith("/Dashboard") && !b.includes("//") && !b.includes("\\") ? b : def;
}

async function photo(f: FormDataEntryValue | null, cat: string, name: string) {
  if (!(f instanceof File) || f.size === 0) return null;
  const ext = (f.name.split(".").pop() ?? "").toLowerCase();
  if (!EXT.includes(ext) || !f.type.startsWith("image/") || f.size > 3 * 1024 * 1024) return "bad";
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "menu";
  const fn = `${slug}-${Date.now()}.${ext}`;
  // Di Vercel: simpan ke Vercel Blob (filesystem read-only). Lokal tanpa token: simpan ke /public.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const b = await put(`img/${cat}/${fn}`, f, { access: "public" });
    return b.url;
  }
  const dir = path.join(process.cwd(), "public", "img", cat);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fn), Buffer.from(await f.arrayBuffer()));
  return `img/${cat}/${fn}`;
}

export async function saveMenu(fd: FormData) {
  await needAdmin();
  const id = Number(fd.get("id")) || 0;
  const name = String(fd.get("name") ?? "").trim();
  const cat = String(fd.get("cat") ?? "");
  const descr = String(fd.get("descr") ?? "").trim().slice(0, 200);
  const price = Math.trunc(Number(fd.get("price")));
  const avail = !!fd.get("avail");
  const to = "/Dashboard/Menu";
  if (!name || name.length > 60 || !["food", "drink"].includes(cat)) redirect(`${to}?err=data`);
  if (!Number.isFinite(price) || price < 0 || price > 1000000) redirect(`${to}?err=price`);

  const img = await photo(fd.get("foto"), cat, name);
  if (img === "bad") redirect(`${to}?err=foto`);

  if (id) {
    const r = await prisma.menu.findUnique({ where: { id }, select: { id: true } });
    if (!r) redirect(`${to}?err=data`);
    await prisma.menu.update({
      where: { id },
      data: { name, cat: cat as "food" | "drink", descr, price, avail, ...(img ? { img } : {}) },
    });
  } else {
    if (!img) redirect(`${to}?err=nofoto`);
    await prisma.menu.create({ data: { name, cat: cat as "food" | "drink", descr, price, img, avail } });
  }
  redirect(`${to}?ok=saved`);
}

export async function deleteMenu(fd: FormData) {
  await needAdmin();
  const id = Number(fd.get("id"));
  const to = "/Dashboard/Menu";
  if (!id) redirect(to);
  if (await prisma.orderItem.findFirst({ where: { menuId: id }, select: { id: true } })) redirect(`${to}?err=used`);
  await prisma.menu.deleteMany({ where: { id } });
  redirect(`${to}?ok=deleted`);
}

export async function setStatus(fd: FormData) {
  await needAdmin();
  const id = Number(fd.get("id"));
  const st = String(fd.get("status"));
  const to = back(fd, "/Dashboard/Orders");
  const o = id ? await prisma.order.findUnique({ where: { id }, select: { status: true } }) : null;
  if (o && ST.includes(st) && !["done", "cancelled"].includes(o.status)) {
    await prisma.order.update({ where: { id }, data: { status: st as OrderStatus } });
  }
  redirect(to);
}

export async function setPay(fd: FormData) {
  await needAdmin();
  const id = Number(fd.get("id"));
  const st = String(fd.get("status"));
  const to = back(fd, "/Dashboard/Payments");
  const o = id ? await prisma.order.findUnique({ where: { id }, select: { status: true } }) : null;
  if (o && PS.includes(st) && o.status !== "cancelled") {
    await prisma.payment.updateMany({
      where: { orderId: id },
      data: { status: st as PayStatus, paidAt: st === "paid" ? new Date() : null },
    });
  }
  redirect(to);
}
