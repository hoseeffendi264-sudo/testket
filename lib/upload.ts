import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const EXT = ["jpg", "jpeg", "png", "webp"];

// Mengembalikan: null = tidak ada file, "bad" = file tidak valid, selain itu = path/URL gambar.
// Sama seperti upload foto menu: Vercel Blob kalau token ada, kalau tidak ke public/img/<folder>.
export async function savePhoto(f: FormDataEntryValue | null, folder: string, name: string) {
  if (!(f instanceof File) || f.size === 0) return null;

  const ext = (f.name.split(".").pop() ?? "").toLowerCase();
  if (!EXT.includes(ext) || !f.type.startsWith("image/") || f.size > 3 * 1024 * 1024) return "bad";

  let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  if (!slug) slug = folder;
  const fn = slug + "-" + Date.now() + "." + ext;

  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
    const b = await put("img/" + folder + "/" + fn, f, { access: "public" });
    return b.url;
  }

  const dir = path.join(process.cwd(), "public", "img", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fn), Buffer.from(await f.arrayBuffer()));
  return "img/" + folder + "/" + fn;
}
