import Link from "next/link";
import { dashboardStats } from "@/lib/queries";
import { needAdmin } from "@/lib/admin";
import { AdminNav, PBadge, SBadge, rp, tname } from "./ui";

export const instant = false;

export default async function Home() {
  await needAdmin();

  const { od, rv, ac, upN, upT, all, rc, top } = await dashboardStats();

  const cards = [
    ["Pesanan hari ini", String(od), "bi-receipt"],
    ["Pendapatan hari ini", rp(rv), "bi-cash-coin"],
    ["Pesanan aktif", String(ac), "bi-fire"],
    ["Belum dibayar", `${upN} (${rp(upT)})`, "bi-hourglass-split"],
  ];

  return (
    <>
    <AdminNav on="home" />
    <section className="py-4 kn-section-menu min-vh-100">
      <div className="container">
        <h2 className="fw-bold kn-heading mb-4">Overview</h2>

        <div className="row g-3 mb-4">
          {cards.map(([t, v, ic]) => (
            <div key={t} className="col-12 col-sm-6 col-lg-3">
              <div className="kn-card-static shadow-sm p-3 h-100">
                <div className="text-muted small"><i className={`bi ${ic} me-1`}></i>{t}</div>
                <div className="fs-4 fw-bold kn-price">{v}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="kn-card-static shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold kn-text-primary mb-0">Pesanan terbaru</h5>
                <Link href="/Dashboard/Orders" className="small">Lihat semua</Link>
              </div>
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr><th>#</th><th>Waktu</th><th>Pelanggan</th><th>Tipe</th><th>Total</th><th>Status</th><th>Bayar</th></tr>
                  </thead>
                  <tbody>
                    {rc.length === 0 && <tr><td colSpan={7} className="text-center text-muted py-3">Belum ada pesanan.</td></tr>}
                    {rc.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.at}</td>
                        <td>{o.email}</td>
                        <td>{tname[o.type]}{o.tbl ? ` (${o.tbl})` : ""}</td>
                        <td>{rp(o.total)}</td>
                        <td><SBadge s={o.status} /></td>
                        <td><PBadge s={o.pay} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="kn-card-static shadow-sm p-3 mb-4">
              <h5 className="fw-bold kn-text-primary">Menu terlaris</h5>
              {top.length === 0 && <p className="text-muted mb-0">Belum ada data.</p>}
              <ul className="list-group list-group-flush">
                {top.map((t) => (
                  <li key={t.name} className="list-group-item d-flex justify-content-between px-0">
                    <span>{t.name}</span>
                    <span className="fw-bold">{t.q}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="kn-card-static shadow-sm p-3">
              <div className="text-muted small">Total pendapatan (lunas)</div>
              <div className="fs-4 fw-bold kn-price">{rp(all)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
