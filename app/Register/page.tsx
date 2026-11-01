import { redirect } from "next/navigation";
import TopNavbar from "../component/topnavbar";
import WebFooter from "../component/webfooter";
import { register } from "../../lib/actions";
import { getSession } from "@/lib/session";

export const instant = false;

export default async function Home({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  const session = await getSession();
  const { err } = await searchParams;
  if (session.isLoggedIn && session.userId) {
    redirect(session.role === "admin" ? "/Dashboard" : "/");
  }
  return (
    <>
    <TopNavbar />
      <section className="container-fluid min-vh-100 d-flex justify-content-center align-items-center kn-section-menu">
        <div className="kn-card-static shadow p-4" style={{ width: "100%", maxWidth: "400px" }}>
          <h3 className="fw-bold kn-text-primary text-center mb-4">Register</h3>

          {err && <div className="alert alert-danger py-2">{err === "exists" ? "Email sudah terdaftar." : "Email tidak valid atau password kurang dari 6 karakter."}</div>}

          <form action={register}>
            <div className="mb-3">
              <label htmlFor="email" className="fw-bold kn-text-primary form-label">Email</label>
              <input type="email" id="email" name="email" className="form-control" placeholder="Enter your email" required />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="fw-bold kn-text-primary form-label">Password</label>
              <input type="password" id="password" name="password" className="form-control" placeholder="Enter your password" required />
            </div>

            <button type="submit" className="btn kn-btn-primary w-100">Register</button>
          </form>
        </div>
      </section>
    <WebFooter />
    </>
  );
}