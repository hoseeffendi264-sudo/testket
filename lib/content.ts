import "server-only";
import { prisma } from "./db";

/* ---------- Tipe ---------- */

export type Slide = { id: string; img: string; title: string; text: string };

export type About = {
  img: string;
  heading: string;
  p1: string;
  p2: string;
  stats: { value: string; label: string }[];
};

export const MAX_SLIDES = 8;

/* ---------- Isi bawaan (sama dengan tampilan sebelum ada CMS) ---------- */

export const DEFAULT_SLIDES: Slide[] = [
  { id: "s1", img: "img/carousel1.jpg", title: "Cita Rasa Nusantara", text: "Nikmati makanan dan minuman terbaik dari berbagai penjuru Indonesia" },
  { id: "s2", img: "img/carousel2.jpg", title: "Promo Spesial Bulan Ini", text: "Diskon 30% untuk semua pembelian lebih dari 2 item" },
  { id: "s3", img: "img/carousel3.jpg", title: "Bahan-bahan Pilihan", text: "Dipilih dari tempat-tempat berkualitas tinggi" },
];

export const DEFAULT_ABOUT: About = {
  img: "img/about.jpg",
  heading: "Tentang Ketoprak Nusantara",
  p1: "**Ketoprak** adalah salah satu kuliner khas Indonesia yang lahir dari kesederhanaan dan kaya akan cita rasa. Di Ketoprak Nusantara, kami menghadirkan sajian ini dengan perhatian pada kualitas bahan, keseimbangan rasa, dan pengalaman menikmati makanan.",
  p2: "Mulai dari tahu yang lembut, tauge segar, bihun, lontong, hingga saus kacang khas yang menjadi karakter utama—setiap elemen dipersiapkan untuk menciptakan rasa yang familiar sekaligus berkesan.",
  stats: [
    { value: "#1", label: "Resto seluruh Indonesia" },
    { value: "50+", label: "Branch" },
    { value: "4.8", label: "Rating" },
  ],
};

/* ---------- Penyimpanan (tabel key-value site_content) ----------
   Tabel dibuat otomatis kalau belum ada, jadi tidak perlu migrasi.
   Bentuknya sama dengan model Prisma SiteContent (lihat README-CMS). */

let ready = false;

async function ensure() {
  if (ready) return;
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS site_content (
       key TEXT PRIMARY KEY,
       value JSONB NOT NULL,
       updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
     )`
  );
  ready = true;
}

async function read(key: string): Promise<unknown> {
  await ensure();
  const rows = await prisma.$queryRaw<{ v: string }[]>`SELECT value::text AS v FROM site_content WHERE key = ${key}`;
  if (rows.length === 0) return null;
  try {
    return JSON.parse(rows[0].v);
  } catch {
    return null;
  }
}

async function write(key: string, val: unknown) {
  await ensure();
  const json = JSON.stringify(val);
  await prisma.$executeRaw`
    INSERT INTO site_content (key, value, updated_at)
    VALUES (${key}, ${json}::jsonb, CURRENT_TIMESTAMP)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`;
}

const str = (v: unknown, def: string) => (typeof v === "string" ? v : def);

/* ---------- Carousel ---------- */

export async function getSlides(): Promise<Slide[]> {
  try {
    const v = await read("carousel");
    if (!Array.isArray(v)) return DEFAULT_SLIDES;
    const out: Slide[] = [];
    for (const s of v) {
      if (s && typeof s === "object" && typeof s.id === "string" && typeof s.img === "string" && s.img) {
        out.push({ id: s.id, img: s.img, title: str(s.title, ""), text: str(s.text, "") });
      }
    }
    return out.length > 0 ? out : DEFAULT_SLIDES;
  } catch {
    // Halaman publik tidak boleh rusak kalau DB bermasalah
    return DEFAULT_SLIDES;
  }
}

export async function setSlides(slides: Slide[]) {
  await write("carousel", slides);
}

/* ---------- Tentang ---------- */

export async function getAbout(): Promise<About> {
  try {
    const v = await read("about");
    if (!v || typeof v !== "object") return DEFAULT_ABOUT;
    const o = v as Partial<About>;
    const stats = DEFAULT_ABOUT.stats.map((d, i) => {
      const s = Array.isArray(o.stats) ? o.stats[i] : undefined;
      return { value: str(s?.value, d.value), label: str(s?.label, d.label) };
    });
    return {
      img: str(o.img, DEFAULT_ABOUT.img) || DEFAULT_ABOUT.img,
      heading: str(o.heading, DEFAULT_ABOUT.heading),
      p1: str(o.p1, DEFAULT_ABOUT.p1),
      p2: str(o.p2, DEFAULT_ABOUT.p2),
      stats,
    };
  } catch {
    return DEFAULT_ABOUT;
  }
}

export async function setAbout(a: About) {
  await write("about", a);
}
