import TopNavbar from "./component/topnavbar";
import WebFooter from "./component/webfooter";
import TheCarousel from "./component/thecarousel";
import Rich from "./component/rich";
import { getAbout, getSlides } from "@/lib/content";
import { imgSrc } from "@/lib/queries";

export const instant = false;

export default async function Home() {
  const [slides, about] = await Promise.all([getSlides(), getAbout()]);

  return (
    <>
    <TopNavbar />
    <TheCarousel slides={slides} />
    <section id="tentang" className="py-5 kn-section-tentang">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-12 col-lg-6 text-center">
            <img src={imgSrc(about.img)} alt={about.heading} className="img-fluid rounded-4 shadow" />
          </div>
          <div className="col-12 col-lg-6">
            <h2 className="fw-bold kn-heading mb-3">{about.heading}</h2>
            <p className="text-muted mb-3"><Rich text={about.p1} /></p>
            {about.p2 && <p className="text-muted mb-4"><Rich text={about.p2} /></p>}
            <div className="d-flex gap-3 flex-wrap">
              {about.stats.filter((s) => s.value || s.label).map((s, i) => (
                <div key={i} className="text-center p-3 bg-white rounded-3 shadow-sm kn-stat-box">
                  <h4 className="fw-bold kn-text-primary mb-0">{s.value}</h4>
                  <small className="text-muted">{s.label}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
    <WebFooter />
    </>
  );
}
