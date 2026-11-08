import Link from "next/link";
import { listOrderLines, listOrders } from "@/lib/queries";
import { needAdmin } from "@/lib/admin";
import { setStatus } from "@/lib/admin-actions";
import { AdminNav, PBadge, SBadge, mname, rp, sname, tname } from "../ui";

export const instant = false;

type O = { id: number; type: string; tbl: string | null; status: string; total: number; note: string; at: string; email: string; method: string; pay: string };
type L = { order_id: number; name: string; qty: number };

const tabs = ["", "pending", "cooking", "ready", "done", "cancelled"];

export default async function Home({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  await needAdmin();
  const q = await searchParams;
  const f = q.s && tabs.includes(q.s) ? q.s : "";

  const os: O[] = await listOrders(f);
  const ls: L[] = await listOrderLines(os.map((o) => o.id));
  const by: Record<number, L[]> = {};
  for (const l of ls) {
    if (!by[l.order_id]) by[l.order_id] = [];
    by[l.order_id].push(l);
  }
  const back = "/Dashboard/Orders" + (f ? `?s=${f}` : "");

  return (
    <>
    <AdminNav on="orders" />
    <section className="py-4 kn-section-menu min-vh-100">
      <div className="container">
        <h2 className="fw-bold kn-heading mb-3">Kelola Pesanan</h2>

        <ul className="nav nav-pills mb-4">
          {tabs.map((t) => (
            <li key={t} className="nav-item">
              <Link className={`nav-link${f === t ? " active" : ""}`} href={t ? `/Dashboard/Orders?s=${t}` : "/Dashboard/Orders"}>
                {t ? sname[t] : "Semua"}
              </Link>
            </li>
          ))}
        </ul>

        {os.length === 0 && <div className="kn-card-static shadow-sm p-4 text-center text-muted">Tidak ada pesanan.</div>}

        <div className="row g-3">
          {os.map((o) => {
            const lock = o.status === "done" || o.status === "cancelled";
            return (
              <div key={o.id} className="col-12 col-lg-6">
                <div className="kn-card-static shadow-sm p-3 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="fw-bold">Pesanan #{o.id}</div>
                      <div className="text-muted small">{o.at} - {o.email}</div>
                    </div>
                    <div className="text-end">
                      <SBadge s={o.status} /> <PBadge s={o.pay} />
                    </div>
                  </div>
                  <div className="small mb-2">
                    {tname[o.type]}{o.tbl ? `, meja ${o.tbl}` : ""} - {mname[o.method]}
                  </div>
                  <ul className="list-unstyled mb-2">
                    {(by[o.id] ?? []).map((l, i) => (
                      <li key={i}>{l.qty} x {l.name}</li>
                    ))}
                  </ul>
                  {o.note && <div className="small fst-italic mb-2">Catatan: {o.note}</div>}
                  <div className="fw-bold kn-price mb-3">{rp(o.total)}</div>
                  <form action={setStatus} className="d-flex gap-2">
                    <input type="hidden" name="id" value={o.id} />
                    <input type="hidden" name="back" value={back} />
                    <select name="status" defaultValue={o.status} disabled={lock} className="form-select form-select-sm">
                      {Object.keys(sname).map((k) => (
                        <option key={k} value={k}>{sname[k]}</option>
                      ))}
                    </select>
                    <button type="submit" disabled={lock} className="btn btn-sm kn-btn-primary">Ubah</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
    </>
  );
}
