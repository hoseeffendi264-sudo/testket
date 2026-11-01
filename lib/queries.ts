import "server-only";
import { prisma } from "./db";
import type { OrderStatus, PayStatus } from "./generated/prisma/client";

// Format "dd/MM HH:mm" dalam zona waktu WIB (sama seperti strftime +7 hours di SQLite)
const wib = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
export function fmt(d: Date | null | undefined) {
  if (!d) return null;
  const p = Object.fromEntries(wib.formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.day}/${p.month} ${p.hour}:${p.minute}`;
}

// Awal hari ini (00:00 WIB) dalam UTC
function startOfTodayWIB() {
  const wibNow = new Date(Date.now() + 7 * 3600 * 1000);
  const d = Date.UTC(wibNow.getUTCFullYear(), wibNow.getUTCMonth(), wibNow.getUTCDate());
  return new Date(d - 7 * 3600 * 1000);
}

export async function listOrders(status?: OrderStatus) {
  const rows = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: { user: { select: { email: true } }, payment: true },
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
  if (!ids.length) return [];
  const rows = await prisma.orderItem.findMany({
    where: { orderId: { in: ids } },
    include: { menu: { select: { name: true } } },
    orderBy: { id: "asc" },
  });
  return rows.map((i) => ({ order_id: i.orderId, name: i.menu.name, qty: i.qty }));
}

export async function listPayments(status?: PayStatus) {
  const rows = await prisma.payment.findMany({
    where: status ? { status } : undefined,
    include: { order: { include: { user: { select: { email: true } } } } },
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
  const since = startOfTodayWIB();
  const [od, rv, ac, up, all, rc, grp] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: since }, status: { not: "cancelled" } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "paid", paidAt: { gte: since } } }),
    prisma.order.count({ where: { status: { in: ["pending", "cooking", "ready"] } } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { status: "unpaid", order: { status: { not: "cancelled" } } },
    }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "paid" } }),
    listOrders().then((r) => r.slice(0, 8)),
    prisma.orderItem.groupBy({
      by: ["menuId"],
      _sum: { qty: true },
      where: { order: { status: { not: "cancelled" } } },
      orderBy: [{ _sum: { qty: "desc" } }, { menuId: "asc" }],
      take: 5,
    }),
  ]);
  const names = await prisma.menu.findMany({ where: { id: { in: grp.map((g) => g.menuId) } }, select: { id: true, name: true } });
  const nm = new Map(names.map((m) => [m.id, m.name]));
  return {
    od,
    rv: rv._sum.amount ?? 0,
    ac,
    upN: up._count,
    upT: up._sum.amount ?? 0,
    all: all._sum.amount ?? 0,
    rc,
    top: grp.map((g) => ({ name: nm.get(g.menuId) ?? "?", q: g._sum.qty ?? 0 })),
  };
}

// Lokasi gambar: URL penuh (Vercel Blob) atau path lokal di /public
export const imgSrc = (img: string) => (img.startsWith("http") ? img : `/${img}`);
