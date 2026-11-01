import { prisma } from "@/lib/db";
import { imgSrc } from "@/lib/queries";
import { needAdmin } from "@/lib/admin";
import { deleteMenu, saveMenu } from "@/lib/admin-actions";
import { AdminNav, rp } from "../ui";

export const instant = false;

type M = { id: number; name: string; cat: string; descr: string; price: number; img: string; avail: boolean };

const oks: Record<string, string> = { saved: "Menu disimpan.", deleted: "Menu dihapus." };
const errs: Record<string, string> = {
  data: "Nama kosong atau terlalu panjang, atau kategori tidak valid.",
  price: "Harga harus angka antara 0 dan 1.000.000.",
  foto: "Foto harus jpg, png, atau webp dengan ukuran maksimal 3 MB.",
  nofoto: "Menu baru harus punya foto.",
  used: "Menu ini sudah pernah dipesan dan tidak bisa dihapus. Nonaktifkan saja.",
};

function Fields({ m }: { m?: M }) {
  return (
    <>
      {m && <input type="hidden" name="id" value={m.id} />}
      <div className="row g-2">
        <div className="col-12 col-md-8">
          <label className="form-label small fw-bold mb-0">Nama</label>
          <input type="text" name="name" defaultValue={m?.name} maxLength={60} className="form-control form-control-sm" required />
        </div>
        <div className="col-6 col-md-4">
          <label className="form-label small fw-bold mb-0">Kategori</label>
          <select name="cat" defaultValue={m?.cat ?? "food"} className="form-select form-select-sm">
            <option value="food">Makanan</option>
            <option value="drink">Minuman</option>
          </select>
        </div>
        <div className="col-6 col-md-4">
          <label className="form-label small fw-bold mb-0">Harga (Rp)</label>
          <input type="number" name="price" defaultValue={m?.price} min={0} max={1000000} className="form-control form-control-sm" required />
        </div>
        <div className="col-12 col-md-8">
          <label className="form-label small fw-bold mb-0">{m ? "Ganti foto (opsional)" : "Foto"}</label>
          <input type="file" name="foto" accept="image/jpeg,image/png,image/webp" className="form-control form-control-sm" required={!m} />
        </div>
        <div className="col-12">
          <label className="form-label small fw-bold mb-0">Deskripsi</label>
          <input type="text" name="descr" defaultValue={m?.descr} maxLength={200} className="form-control form-control-sm" />
        </div>
        <div className="col-12">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" name="avail" id={`av${m?.id ?? "new"}`} defaultChecked={m ? m.avail : true} />
            <label className="form-check-label small" htmlFor={`av${m?.id ?? "new"}`}>Tersedia</label>
          </div>
        </div>
      </div>
    </>
  );
}

export default async function Home({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await needAdmin();
  const q = await searchParams;
  const all = await prisma.menu.findMany({ orderBy: { id: "asc" } });
  const ms = [...all.filter((m) => m.cat === "food"), ...all.filter((m) => m.cat === "drink")] as M[];

  return (
    <>
    <AdminNav on="menu" />
    <section className="py-4 kn-section-menu min-vh-100">
      <div className="container">
        <h2 className="fw-bold kn-heading mb-4">Kelola Menu</h2>

        {q.ok && oks[q.ok] && <div className="alert alert-success py-2">{oks[q.ok]}</div>}
        {q.err && errs[q.err] && <div className="alert alert-danger py-2">{errs[q.err]}</div>}

        <form action={saveMenu} className="kn-card-static shadow-sm p-3 mb-4">
          <h5 className="fw-bold kn-text-primary mb-3">Tambah menu</h5>
          <Fields />
          <button type="submit" className="btn kn-btn-primary mt-3">Tambah</button>
        </form>

        <div className="row g-4">
          {ms.map((m) => (
            <div key={m.id} className="col-12 col-lg-6">
              <div className="kn-card-static shadow-sm p-3 h-100">
                <div className="d-flex gap-3 mb-3">
                  <img src={imgSrc(m.img)} alt={m.name} className="rounded" style={{ width: "88px", height: "88px", objectFit: "cover" }} />
                  <div>
                    <div className="fw-bold">{m.name}</div>
                    <div className="kn-price fw-bold">{rp(m.price)}</div>
                    <span className={`badge ${m.avail ? "bg-success" : "bg-secondary"}`}>{m.avail ? "Tersedia" : "Nonaktif"}</span>
                  </div>
                </div>
                <form action={saveMenu}>
                  <Fields m={m} />
                  <button type="submit" className="btn btn-sm kn-btn-primary mt-3">Simpan</button>
                </form>
                <form action={deleteMenu} className="mt-2">
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" className="btn btn-sm btn-outline-danger">Hapus</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
