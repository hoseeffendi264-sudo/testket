import Link from "next/link";
import { logout } from "@/lib/actions";

export const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export const tname: Record<string, string> = { dine_in: "Makan di tempat", takeaway: "Bawa pulang" };
export const mname: Record<string, string> = { cash: "Tunai", qris: "QRIS", transfer: "Transfer" };
export const sname: Record<string, string> = { pending: "Menunggu", cooking: "Dimasak", ready: "Siap", done: "Selesai", cancelled: "Dibatalkan" };
export const pname: Record<string, string> = { unpaid: "Belum dibayar", paid: "Lunas", failed: "Gagal" };

const sbg: Record<string, string> = {
  pending: "bg-secondary",
  cooking: "bg-warning text-dark",
  ready: "bg-info text-dark",
  done: "bg-success",
  cancelled: "bg-danger",
};
const pbg: Record<string, string> = { unpaid: "bg-warning text-dark", paid: "bg-success", failed: "bg-danger" };

export function SBadge({ s }: { s: string }) {
  return <span className={`badge ${sbg[s]}`}>{sname[s]}</span>;
}

export function PBadge({ s }: { s: string }) {
  return <span className={`badge ${pbg[s]}`}>{pname[s]}</span>;
}

const links = [
  ["home", "/Dashboard", "Overview"],
  ["menu", "/Dashboard/Menu", "Menu"],
  ["orders", "/Dashboard/Orders", "Pesanan"],
  ["pay", "/Dashboard/Payments", "Pembayaran"],
];

export function AdminNav({ on }: { on: string }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark kn-navbar sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" href="/Dashboard">
          <i className="bi bi-speedometer2 me-2 fs-4"></i>
          Admin Ketoprak Nusantara
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNav" aria-controls="adminNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="adminNav">
          <ul className="navbar-nav ms-auto">
            {links.map(([k, h, t]) => (
              <li key={k} className="nav-item">
                <Link className={`nav-link${on === k ? " active fw-bold" : ""}`} href={h}>{t}</Link>
              </li>
            ))}
            <li className="nav-item">
              <form action={logout}><button className="nav-link">Log out</button></form>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
