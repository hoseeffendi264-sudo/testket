import "server-only";
import { prisma } from "./db";
import type { OrderStatus, PayStatus } from "./generated/prisma/client";

function pad(n: number) {
  return n < 10 ? "0" + n : String(n);
}

export function fmt(d: Date | null) {
  if (!d) return null;
  const w = new Date(d.getTime() + 7 * 3600 * 1000);
  return pad(w.getUTCDate()) + "/" + pad(w.getUTCMonth() + 1) + " " + pad(w.getUTCHours()) + ":" + pad(w.getUTCMinutes());
}

function awalHari() {
  const w = new Date(Date.now() + 7 * 3600 * 1000);
  const t = Date.UTC(w.getUTCFullYear(), w.getUTCMonth(), w.getUTCDate());
  return new Date(t - 7 * 3600 * 1000);
}

export function imgSrc(img: string) {
  if (img.startsWith("http")) return img;
  return "/" + img;
}

export async function listOrders(status?: string) {
  const where: { status?: OrderStatus } = {};
  if (status) where.status = status as OrderStatus;

  const rows = await prisma.order.findMany({
    where,
    include: { user: true, payment: true },
    orderBy: { id: "desc" },
    take: 100,
  });

  return rows.map((o) => ({
    id: o.id,
    type: o.type as string,
    tbl: o.tbl,
    status: o.status as string,
    total: o.total,
    note: o.note,
    at: fmt(o.createdAt) ?? "",
    email: o.user.email,
    method: (o.payment?.method ?? "cash") as string,
    pay: (o.payment?.status ?? "unpaid") as string,
  }));
}

export async function listOrderLines(ids: number[]) {
  if (ids.length === 0) return [];

  const rows = await prisma.orderItem.findMany({
    where: { orderId: { in: ids } },
    include: { menu: true },
    orderBy: { id: "asc" },
  });

  return rows.map((i) => ({ order_id: i.orderId, name: i.menu.name, qty: i.qty }));
}

export async function listPayments(status?: string) {
  const where: { status?: PayStatus } = {};
  if (status) where.status = status as PayStatus;

  const rows = await prisma.payment.findMany({
    where,
    include: { order: { include: { user: true } } },
    orderBy: { orderId: "desc" },
    take: 100,
  });

  return rows.map((p) => ({
    id: p.orderId,
    status: p.order.status as string,
    total: p.amount,
    at: fmt(p.order.createdAt) ?? "",
    email: p.order.user.email,
    method: p.method as string,
    pay: p.status as string,
    paid: fmt(p.paidAt),
  }));
}

export async function dashboardStats() {
  const since = awalHari();

  const od = await prisma.order.count({
    where: { createdAt: { gte: since }, status: { not: "cancelled" } },
  });

  const rv = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: "paid", paidAt: { gte: since } },
  });

  const ac = await prisma.order.count({
    where: { status: { in: ["pending", "cooking", "ready"] } },
  });

  const up = await prisma.payment.aggregate({
    _sum: { amount: true },
    _count: true,
    where: { status: "unpaid", order: { status: { not: "cancelled" } } },
  });

  const all = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: "paid" },
  });

  const rc = (await listOrders()).slice(0, 8);

  const grp = await prisma.orderItem.groupBy({
    by: ["menuId"],
    _sum: { qty: true },
    where: { order: { status: { not: "cancelled" } } },
    orderBy: [{ _sum: { qty: "desc" } }, { menuId: "asc" }],
    take: 5,
  });
  const menus = await prisma.menu.findMany({
    where: { id: { in: grp.map((g) => g.menuId) } },
  });
  const top = [];
  for (const g of grp) {
    const m = menus.find((x) => x.id === g.menuId);
    top.push({ name: m ? m.name : "-", q: g._sum.qty ?? 0 });
  }

  return {
    od,
    rv: rv._sum.amount ?? 0,
    ac,
    upN: up._count,
    upT: up._sum.amount ?? 0,
    all: all._sum.amount ?? 0,
    rc,
    top,
  };
}
