import { config } from "dotenv";
config({ path: [".env.local", ".env"] });
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL! }),
});

const hash = (p: string) => {
  const s = randomBytes(16).toString("hex");
  return s + ":" + scryptSync(p, s, 64).toString("hex");
};

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@ketoprak.com" },
    update: {},
    create: { email: "admin@ketoprak.com", pass: hash("Admin123!"), role: "admin" },
  });
  await prisma.user.upsert({
    where: { email: "user@ketoprak.com" },
    update: {},
    create: { email: "user@ketoprak.com", pass: hash("User123!"), role: "user" },
  });

  if ((await prisma.menu.count()) === 0) {
    await prisma.menu.createMany({
      data: [
        { name: "Ketoprak Original", cat: "food", price: 18000, img: "img/food/ketoprak-original.jpg" },
        { name: "Ketoprak Jumbo", cat: "food", price: 23000, img: "img/food/ketoprak-jumbo.jpg" },
        { name: "Ketoprak Telur", cat: "food", price: 18000, img: "img/food/ketoprak-telur.jpg" },
        { name: "Ketoprak Nusantara", cat: "food", price: 21000, img: "img/food/ketoprak-nusantara.jpg" },
        { name: "Ketoprak Komplit", cat: "food", price: 21000, img: "img/food/ketoprak-komplit.jpg" },
        { name: "Air Mineral", cat: "drink", price: 5000, img: "img/drink/air-mineral.jpg" },
        { name: "Teh Manis", cat: "drink", price: 5000, img: "img/drink/teh-manis.jpg" },
        { name: "Lemonade", cat: "drink", price: 6000, img: "img/drink/lemonade.jpg" },
        { name: "Yum-Soda", cat: "drink", price: 8000, img: "img/drink/yum-soda.jpg" },
        { name: "Kopi Nusantara", cat: "drink", price: 8000, img: "img/drink/kopi-nusantara.jpg" },
      ],
    });
  }
}

main().finally(() => prisma.$disconnect());
