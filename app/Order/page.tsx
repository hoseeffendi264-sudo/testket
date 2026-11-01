import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { imgSrc } from "@/lib/queries";
import { addToCart } from "@/lib/actions";
import Link from "next/link";
import TheCarousel from "../component/thecarousel";
import TopNavbar from "../component/topnavbar";
import WebFooter from "../component/webfooter";
import { redirect } from "next/navigation";

export const instant = false;

type M = { id: number; name: string; cat: string; descr: string; price: number; img: string };

const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");

function Cards({ list }: { list: M[] }) {
  return (
    <div className="row g-4">
      {list.map((m) => (
        <div key={m.id} className="col-12 col-md-6 col-lg-4">
          <div className="card kn-card h-100 shadow-sm rounded-3 border-0" data-bs-toggle="modal" data-bs-target={`#modalMenu${m.id}`} style={{ cursor: "pointer" }}>
            <img src={imgSrc(m.img)} className="card-img-top kn-card-img" alt={m.name} />
            <div className="card-body text-center p-4">
              <h5 className="card-title fw-bold">{m.name}</h5>
              <p className="card-text text-muted">{m.descr || "PLACEHOLDER TEXT"}</p>
              <p className="kn-price fw-bold">{rp(m.price)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Modal({ m }: { m: M }) {
  return (
    <div className="modal fade" id={`modalMenu${m.id}`} tabIndex={-1} aria-labelledby={`modalMenu${m.id}Label`} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content kn-modal-content border-0 rounded-4 overflow-hidden">
          <img src={imgSrc(m.img)} className="img-fluid" alt={m.name} />
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold" id={`modalMenu${m.id}Label`}>{m.name}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form action={addToCart}>
            <input type="hidden" name="id" value={m.id} />
            <div className="modal-body">
              <p className="text-muted">{m.descr || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}</p>
              <h5 className="kn-price fw-bold mt-3">{rp(m.price)}</h5>
              <div className="d-flex align-items-center gap-2 mt-3">
                <label htmlFor={`qty${m.id}`} className="fw-bold">Jumlah</label>
                <input type="number" id={`qty${m.id}`} name="qty" defaultValue={1} min={1} max={20} className="form-control" style={{ width: "90px" }} />
              </div>
            </div>
            <div className="modal-footer border-0">
              <button type="submit" className="btn kn-btn-primary rounded-pill px-4" data-bs-dismiss="modal">Pesan Sekarang</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) redirect("/Login");
  if (session.role == "admin") redirect("/Dashboard");

  const ms = (await prisma.menu.findMany({ where: { avail: true }, orderBy: { id: "asc" } })) as M[];
  const food = ms.filter((m) => m.cat === "food");
  const drink = ms.filter((m) => m.cat === "drink");

  return (
    <>
    <TopNavbar />
    <TheCarousel />
    <section id="foodmenu" className="py-5 kn-section-menu">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold kn-heading">Menu Makanan</h2>
          <p className="text-muted">Pilihan makanan terbaik dari seluruh Nusantara</p>
        </div>
        <Cards list={food} />
      </div>
    </section>

    <section id="drinkmenu" className="py-5 kn-section-menu">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold kn-heading">Menu Minuman</h2>
          <p className="text-muted">Pilihan minuman untuk mendampingi makanan</p>
        </div>
        <Cards list={drink} />
      </div>

      <Link href="/Payment" className="btn btn-lg kn-btn-primary-full px-4 mt-5">Check out!</Link>
    </section>

    {ms.map((m) => (
      <Modal key={m.id} m={m} />
    ))}
    <WebFooter />
    </>
  );
}
