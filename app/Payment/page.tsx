import { redirect } from "next/navigation";
import Link from "next/link";
import TopNavbar from "../component/topnavbar";
import WebFooter from "../component/webfooter";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { imgSrc } from "@/lib/queries";
import { cartOp, placeOrder } from "@/lib/actions";

export const instant = false;

type Line = { name: string; qty: number; price: number };
type Ord = { id: number; type: string; tbl: string | null; status: string; total: number; note: string; method: string; pay: string };

const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");

const errs: Record<string, string> = {
  type: "Pilih makan di tempat atau bawa pulang.",
  tbl: "Isi nomor meja untuk makan di tempat.",
  method: "Pilih metode pembayaran.",
  menu: "Ada menu di keranjang yang sudah tidak tersedia.",
};

const tname: Record<string, string> = { dine_in: "Makan di tempat", takeaway: "Bawa pulang" };
const mname: Record<string, string> = { cash: "Tunai", qris: "QRIS", transfer: "Transfer" };
const sname: Record<string, string> = { pending: "Menunggu diproses", cooking: "Sedang dimasak", ready: "Siap diambil", done: "Selesai", cancelled: "Dibatalkan" };
const pname: Record<string, string> = { unpaid: "Belum dibayar", paid: "Lunas", failed: "Gagal" };

async function Done({ id, uid }: { id: number; uid: number }) {
  const row = await prisma.order.findFirst({ where: { id, userId: uid }, include: { payment: true } });
  if (!row || !row.payment) redirect("/Payment");

  const o: Ord = {
    id: row.id,
    type: row.type,
    tbl: row.tbl,
    status: row.status,
    total: row.total,
    note: row.note,
    method: row.payment.method,
    pay: row.payment.status,
  };

  const rows = await prisma.orderItem.findMany({ where: { orderId: id }, include: { menu: true }, orderBy: { id: "asc" } });
  const ls: Line[] = rows.map((i) => ({ name: i.menu.name, qty: i.qty, price: i.price }));

  return (
    <section className="py-5 kn-section-menu min-vh-100">
      <div className="container" style={{ maxWidth: "720px" }}>
        <div className="kn-card-static shadow p-4">
          <h3 className="fw-bold kn-text-primary text-center mb-1">Pesanan Berhasil</h3>
          <p className="text-center text-muted mb-4">Nomor pesanan #{o.id}</p>
          <ul className="list-group list-group-flush mb-3">
            {ls.map((l, i) => (
              <li key={i} className="list-group-item d-flex justify-content-between">
                <span>{l.qty} x {l.name}</span>
                <span>{rp(l.qty * l.price)}</span>
              </li>
            ))}
            <li className="list-group-item d-flex justify-content-between fw-bold">
              <span>Total</span>
              <span className="kn-price">{rp(o.total)}</span>
            </li>
          </ul>
          <dl className="row mb-0">
            <dt className="col-5">Tipe</dt>
            <dd className="col-7">{tname[o.type]}{o.tbl ? ` (Meja ${o.tbl})` : ""}</dd>
            <dt className="col-5">Status pesanan</dt>
            <dd className="col-7">{sname[o.status]}</dd>
            <dt className="col-5">Pembayaran</dt>
            <dd className="col-7">{mname[o.method]} - {pname[o.pay]}</dd>
            {o.note && (
              <>
                <dt className="col-5">Catatan</dt>
                <dd className="col-7">{o.note}</dd>
              </>
            )}
          </dl>
          <Link href="/Order" className="btn kn-btn-primary w-100 mt-4">Pesan lagi</Link>
        </div>
      </div>
    </section>
  );
}

export default async function Home({ searchParams }: { searchParams: Promise<{ order?: string; err?: string }> }) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) redirect("/Login");
  if (session.role == "admin") redirect("/Dashboard");

  const q = await searchParams;
  if (q.order) {
    return (
      <>
      <TopNavbar />
      <Done id={Number(q.order)} uid={Number(session.userId)} />
      <WebFooter />
      </>
    );
  }

  const c = session.cart ?? {};
  const ids = Object.keys(c).map(Number);
  const items = ids.length
    ? await prisma.menu.findMany({ where: { id: { in: ids } }, orderBy: { id: "asc" } })
    : [];
  const total = items.reduce((t, m) => t + m.price * c[m.id], 0);

  return (
    <>
    <TopNavbar />
    <section className="py-5 kn-section-menu min-vh-100">
      <div className="container" style={{ maxWidth: "820px" }}>
        <h2 className="fw-bold kn-heading text-center mb-4">Checkout</h2>

        {items.length === 0 ? (
          <div className="kn-card-static shadow p-5 text-center">
            <p className="text-muted mb-3">Keranjang masih kosong.</p>
            <Link href="/Order" className="btn kn-btn-primary px-4">Lihat menu</Link>
          </div>
        ) : (
          <>
            <div className="kn-card-static shadow p-4 mb-4">
              {items.map((m) => (
                <div key={m.id} className="d-flex align-items-center gap-3 py-3 border-bottom">
                  <img src={imgSrc(m.img)} alt={m.name} className="rounded" style={{ width: "64px", height: "64px", objectFit: "cover" }} />
                  <div className="flex-grow-1">
                    <div className="fw-bold">{m.name}</div>
                    <div className="text-muted small">{rp(m.price)}</div>
                  </div>
                  <form action={cartOp} className="d-inline-flex align-items-center gap-2">
                    <input type="hidden" name="id" value={m.id} />
                    <button name="op" value="dec" className="btn btn-sm btn-outline-secondary">-</button>
                    <span style={{ minWidth: "24px", textAlign: "center" }}>{c[m.id]}</span>
                    <button name="op" value="inc" className="btn btn-sm btn-outline-secondary">+</button>
                    <button name="op" value="del" className="btn btn-sm btn-outline-danger" aria-label="Hapus"><i className="bi bi-trash"></i></button>
                  </form>
                  <div className="fw-bold text-end" style={{ minWidth: "96px" }}>{rp(m.price * c[m.id])}</div>
                </div>
              ))}
              <div className="d-flex justify-content-between pt-3 fs-5 fw-bold">
                <span>Total</span>
                <span className="kn-price">{rp(total)}</span>
              </div>
            </div>

            <form action={placeOrder} className="kn-card-static shadow p-4">
              {q.err && errs[q.err] && <div className="alert alert-danger py-2">{errs[q.err]}</div>}

              <div className="mb-3">
                <div className="fw-bold kn-text-primary mb-2">Tipe pesanan</div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="type" id="tdine" value="dine_in" defaultChecked />
                  <label className="form-check-label" htmlFor="tdine">Makan di tempat</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="type" id="ttake" value="takeaway" />
                  <label className="form-check-label" htmlFor="ttake">Bawa pulang</label>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="tbl" className="fw-bold kn-text-primary form-label">Nomor meja</label>
                <input type="text" id="tbl" name="tbl" maxLength={10} className="form-control" placeholder="Wajib untuk makan di tempat" />
              </div>

              <div className="mb-3">
                <label htmlFor="method" className="fw-bold kn-text-primary form-label">Metode pembayaran</label>
                <select id="method" name="method" className="form-select" defaultValue="cash">
                  <option value="cash">Tunai</option>
                  <option value="qris">QRIS</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="note" className="fw-bold kn-text-primary form-label">Catatan</label>
                <input type="text" id="note" name="note" maxLength={200} className="form-control" placeholder="Contoh: tidak pedas" />
              </div>

              <button type="submit" className="btn kn-btn-primary w-100">Buat Pesanan - {rp(total)}</button>
            </form>
          </>
        )}
      </div>
    </section>
    <WebFooter />
    </>
  );
}
