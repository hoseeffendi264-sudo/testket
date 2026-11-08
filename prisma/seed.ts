import { config } from "dotenv";
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

config({ path: [".env.local", ".env"] });

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

function hash(p: string) {
  const s = randomBytes(16).toString("hex");
  return s + ":" + scryptSync(p, s, 64).toString("hex");
}

async function main() {
  const akun = [
    { email: "admin@ketoprak.com", pass: "Admin123!", role: "admin" as const },
    { email: "user@ketoprak.com", pass: "User123!", role: "user" as const },
  ];
  for (const a of akun) {
    await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: { email: a.email, pass: hash(a.pass), role: a.role },
    });
  }

  const n = await prisma.menu.count();
  if (n > 0) return;

  const food = [
    ["Ketoprak Original", 18000, "ketoprak-original"],
    ["Ketoprak Jumbo", 23000, "ketoprak-jumbo"],
    ["Ketoprak Telur", 18000, "ketoprak-telur"],
    ["Ketoprak Nusantara", 21000, "ketoprak-nusantara"],
    ["Ketoprak Komplit", 21000, "ketoprak-komplit"],
  ] as const;
  const drink = [
    ["Air Mineral", 5000, "air-mineral"],
    ["Teh Manis", 5000, "teh-manis"],
    ["Lemonade", 6000, "lemonade"],
    ["Yum-Soda", 8000, "yum-soda"],
    ["Kopi Nusantara", 8000, "kopi-nusantara"],
  ] as const;

  for (const f of food) {
    await prisma.menu.create({ data: { name: f[0], cat: "food", price: f[1], img: "img/food/" + f[2] + ".jpg" } });
  }
  for (const d of drink) {
    await prisma.menu.create({ data: { name: d[0], cat: "drink", price: d[1], img: "img/drink/" + d[2] + ".jpg" } });
  }
}

main().finally(() => prisma.$disconnect());
