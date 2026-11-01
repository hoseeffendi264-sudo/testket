import Link from "next/link";
import { getSession } from "@/lib/session";
import { logout } from "@/lib/actions";

export default async function TopNavbar() {
    const session = await getSession()
    const n = Object.values(session.cart ?? {}).reduce((a, b) => a + b, 0)
    if (session.isLoggedIn) {
        return (
        <nav className="navbar navbar-expand-lg navbar-dark kn-navbar sticky-top shadow-sm">
            <div className="container">
                <a className="navbar-brand fw-bold d-flex align-items-center" href="#">
                    <i className="bi bi-cup-hot-fill me-2 fs-4"></i>
                    Ketoprak Nusantara
                </a>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                    <li className="nav-item"><Link className="nav-link" href="/">Home</Link></li>
                    {session.role === "admin" && <li className="nav-item"><Link className="nav-link" href="/Dashboard">Dashboard</Link></li>}
                    <li className="nav-item"><Link className="nav-link" href="/Order">Order</Link></li>
                    <li className="nav-item"><Link className="nav-link" href="/Payment">Checkout{n > 0 && <span className="badge bg-light text-dark ms-1">{n}</span>}</Link></li>
                    <li className="nav-item"><form action={logout}><button className="nav-link">Log out</button></form></li>
                    </ul>
                </div>
            </div>
        </nav>
        );
    } else {
        return (
        <nav className="navbar navbar-expand-lg navbar-dark kn-navbar sticky-top shadow-sm">
            <div className="container">
                <a className="navbar-brand fw-bold d-flex align-items-center" href="#">
                    <i className="bi bi-cup-hot-fill me-2 fs-4"></i>
                    Ketoprak Nusantara
                </a>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                    <li className="nav-item"><Link className="nav-link" href="/">Home</Link></li>
                    <li className="nav-item"><Link className="nav-link" href="/Login">Login</Link></li>
                    <li className="nav-item"><Link className="nav-link" href="/Register">Register</Link></li>
                    </ul>
                </div>
            </div>
        </nav>
        );
    }
}