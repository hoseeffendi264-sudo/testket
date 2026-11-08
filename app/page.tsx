import TopNavbar from "./component/topnavbar";
import WebFooter from "./component/webfooter";
import TheCarousel from "./component/thecarousel";

export const instant = false;

export default function Home() {
  return (
    <>
    <TopNavbar />
    <TheCarousel />
    {/* BLANK */}
    <section id="tentang" className="py-5 kn-section-tentang">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-12 col-lg-6 text-center">
            <img src="img/about.jpg" alt="Tentang Ketoprak Nusantara" className="img-fluid rounded-4 shadow" />
          </div>
          <div className="col-12 col-lg-6">
            <h2 className="fw-bold kn-heading mb-3">Tentang Ketoprak Nusantara</h2>
            <p className="text-muted mb-3">
              <strong>Ketoprak</strong> adalah salah satu kuliner khas Indonesia yang lahir dari kesederhanaan dan kaya akan cita rasa. Di Ketoprak Nusantara, kami menghadirkan sajian ini dengan perhatian pada kualitas bahan, keseimbangan rasa, dan pengalaman menikmati makanan.
            </p>
            <p className="text-muted mb-4">
              Mulai dari tahu yang lembut, tauge segar, bihun, lontong, hingga saus kacang khas yang menjadi karakter utama—setiap elemen dipersiapkan untuk menciptakan rasa yang familiar sekaligus berkesan.
            </p>
            <div className="d-flex gap-3 flex-wrap">
              <div className="text-center p-3 bg-white rounded-3 shadow-sm kn-stat-box">
                <h4 className="fw-bold kn-text-primary mb-0">#1</h4>
                <small className="text-muted">Resto seluruh Indonesia</small>
              </div>
              <div className="text-center p-3 bg-white rounded-3 shadow-sm kn-stat-box">
                <h4 className="fw-bold kn-text-primary mb-0">50+</h4>
                <small className="text-muted">Branch</small>
              </div>
              <div className="text-center p-3 bg-white rounded-3 shadow-sm kn-stat-box">
                <h4 className="fw-bold kn-text-primary mb-0">4.8</h4>
                <small className="text-muted">Rating</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <WebFooter />
    </>
  );
}