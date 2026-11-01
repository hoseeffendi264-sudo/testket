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

    <section id="faq" className="py-5 kn-section-faq">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold kn-heading">Pertanyaan yang Sering Diajukan</h2>
          <p className="text-muted">Temukan jawaban untuk pertanyaan umum seputar Kopi Nusantara</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="accordion kn-accordion" id="faqAccordion">

              <div className="accordion-item border-0 mb-3 rounded-3 overflow-hidden shadow-sm">
                <h2 className="accordion-header">
                  <button className="accordion-button kn-accordion-btn" type="button" data-bs-toggle="collapse" data-bs-target="#faq1" aria-expanded="true" aria-controls="faq1">
                    MISSING TABLE STRING ENTRY
                  </button>
                </h2>
                <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                  <div className="accordion-body text-muted">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </div>
                </div>
              </div>

              <div className="accordion-item border-0 mb-3 rounded-3 overflow-hidden shadow-sm">
                <h2 className="accordion-header">
                  <button className="accordion-button kn-accordion-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2" aria-expanded="false" aria-controls="faq2">
                    MISSING TABLE STRING ENTRY
                  </button>
                </h2>
                <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                  <div className="accordion-body text-muted">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </div>
                </div>
              </div>

              <div className="accordion-item border-0 mb-3 rounded-3 overflow-hidden shadow-sm">
                <h2 className="accordion-header">
                  <button className="accordion-button kn-accordion-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3" aria-expanded="false" aria-controls="faq3">
                    MISSING TABLE STRING ENTRY
                  </button>
                </h2>
                <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                  <div className="accordion-body text-muted">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </div>
                </div>
              </div>

              <div className="accordion-item border-0 mb-3 rounded-3 overflow-hidden shadow-sm">
                <h2 className="accordion-header">
                  <button className="accordion-button kn-accordion-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4" aria-expanded="false" aria-controls="faq4">
                    MISSING TABLE STRING ENTRY
                  </button>
                </h2>
                <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                  <div className="accordion-body text-muted">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </div>
                </div>
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