import Link from "next/link";
import { listPayments } from "@/lib/queries";
import { needAdmin } from "@/lib/admin";
import { setPay } from "@/lib/admin-actions";
import { AdminNav, PBadge, SBadge, mname, pname, rp } from "../ui";

export const instant = false;

type P = { id: number; status: string; total: number; at: string; email: string; method: string; pay: string; paid: string | null };

const tabs = ["", "unpaid", "paid", "failed"];

export default async function Home({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  await needAdmin();
  const q = await searchParams;
  const f = q.s && tabs.includes(q.s) ? q.s : "";

  const ps: P[] = await listPayments(f);
  const back = "/Dashboard/Payments" + (f ? `?s=${f}` : "");

  const acts: [string, string, string][] = [
    ["paid", "Lunas", "btn-success"],
    ["failed", "Gagal", "btn-outline-danger"],
    ["unpaid", "Reset", "btn-outline-secondary"],
  ];

  return (
    <>
    <AdminNav on="pay" />
    <section className="py-4 kn-section-menu min-vh-100">
      <div className="container">
        <h2 className="fw-bold kn-heading mb-3">Pembayaran</h2>

        <ul className="nav nav-pills mb-4">
          {tabs.map((t) => (
            <li key={t} className="nav-item">
              <Link className={`nav-link${f === t ? " active" : ""}`} href={t ? `/Dashboard/Payments?s=${t}` : "/Dashboard/Payments"}>
                {t ? pname[t] : "Semua"}
              </Link>
            </li>
          ))}
        </ul>

        <div className="kn-card-static shadow-sm p-3">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr><th>Pesanan</th><th>Pelanggan</th><th>Metode</th><th>Jumlah</th><th>Status</th><th>Dibayar</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {ps.length === 0 && <tr><td colSpan={7} className="text-center text-muted py-3">Tidak ada pembayaran.</td></tr>}
                {ps.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id} <SBadge s={p.status} /></td>
                    <td>{p.email}</td>
                    <td>{mname[p.method]}</td>
                    <td>{rp(p.total)}</td>
                    <td><PBadge s={p.pay} /></td>
                    <td>{p.paid ?? "-"}</td>
                    <td>
                      {p.status === "cancelled" ? (
                        <span className="text-muted small">Pesanan dibatalkan</span>
                      ) : (
                        <form action={setPay} className="d-inline-flex gap-1">
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="back" value={back} />
                          {acts.filter((a) => a[0] !== p.pay).map(([v, t, c]) => (
                            <button key={v} name="status" value={v} className={`btn btn-sm ${c}`}>{t}</button>
                          ))}
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
