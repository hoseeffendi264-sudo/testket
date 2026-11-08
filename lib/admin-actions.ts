"use server";

import { prisma } from "@/lib/db";
import { needAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const EXT = ["jpg", "jpeg", "png", "webp"];

function back(fd: FormData, def: string) {
  const b = String(fd.get("back") ?? "");
  if (b.startsWith("/Dashboard") && !b.includes("//") && !b.includes("\\")) return b;
  return def;
}

async function photo(f: FormDataEntryValue | null, cat: string, name: string) {
  if (!(f instanceof File) || f.size === 0) return null;

  const ext = (f.name.split(".").pop() ?? "").toLowerCase();
  if (!EXT.includes(ext) || !f.type.startsWith("image/") || f.size > 3 * 1024 * 1024) return "bad";

  let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) slug = "menu";
  const fn = slug + "-" + Date.now() + "." + ext;

  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
    const b = await put("img/" + cat + "/" + fn, f, { access: "public" });
    return b.url;
  }

  const dir = path.join(process.cwd(), "public", "img", cat);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fn), Buffer.from(await f.arrayBuffer()));
  return "img/" + cat + "/" + fn;
}

export async function saveMenu(fd: FormData) {
  await needAdmin();
  const id = Number(fd.get("id")) || 0;
  const name = String(fd.get("name") ?? "").trim();
  const c = String(fd.get("cat") ?? "");
  const descr = String(fd.get("descr") ?? "").trim().slice(0, 200);
  const price = Math.trunc(Number(fd.get("price")));
  const avail = !!fd.get("avail");
  const to = "/Dashboard/Menu";

  let cat: "food" | "drink";
  if (c === "food") cat = "food";
  else if (c === "drink") cat = "drink";
  else redirect(to + "?err=data");
  if (!name || name.length > 60) redirect(to + "?err=data");
  if (!Number.isFinite(price) || price < 0 || price > 1000000) redirect(to + "?err=price");

  const img = await photo(fd.get("foto"), cat, name);
  if (img === "bad") redirect(to + "?err=foto");

  if (id) {
    const ada = await prisma.menu.findUnique({ where: { id } });
    if (!ada) redirect(to + "?err=data");
    const data = { name, cat, descr, price, avail, img: ada.img };
    if (img) data.img = img;
    await prisma.menu.update({ where: { id }, data });
  } else {
    if (!img) redirect(to + "?err=nofoto");
    await prisma.menu.create({ data: { name, cat, descr, price, img, avail } });
  }
  redirect(to + "?ok=saved");
}

export async function deleteMenu(fd: FormData) {
  await needAdmin();
  const id = Number(fd.get("id"));
  const to = "/Dashboard/Menu";
  if (!id) redirect(to);

  const dipakai = await prisma.orderItem.findFirst({ where: { menuId: id } });
  if (dipakai) redirect(to + "?err=used");

  await prisma.menu.deleteMany({ where: { id } });
  redirect(to + "?ok=deleted");
}

export async function setStatus(fd: FormData) {
  await needAdmin();
  const id = Number(fd.get("id"));
  const st = String(fd.get("status"));
  const to = back(fd, "/Dashboard/Orders");
  if (!id) redirect(to);

  let status: "pending" | "cooking" | "ready" | "done" | "cancelled";
  if (st === "pending") status = "pending";
  else if (st === "cooking") status = "cooking";
  else if (st === "ready") status = "ready";
  else if (st === "done") status = "done";
  else if (st === "cancelled") status = "cancelled";
  else redirect(to);

  const o = await prisma.order.findUnique({ where: { id } });
  if (o && o.status !== "done" && o.status !== "cancelled") {
    await prisma.order.update({ where: { id }, data: { status } });
  }
  redirect(to);
}

export async function setPay(fd: FormData) {
  await needAdmin();
  const id = Number(fd.get("id"));
  const st = String(fd.get("status"));
  const to = back(fd, "/Dashboard/Payments");
  if (!id) redirect(to);

  let status: "unpaid" | "paid" | "failed";
  if (st === "unpaid") status = "unpaid";
  else if (st === "paid") status = "paid";
  else if (st === "failed") status = "failed";
  else redirect(to);

  const o = await prisma.order.findUnique({ where: { id } });
  if (o && o.status !== "cancelled") {
    await prisma.payment.updateMany({
      where: { orderId: id },
      data: { status, paidAt: status === "paid" ? new Date() : null },
    });
  }
  redirect(to);
}
