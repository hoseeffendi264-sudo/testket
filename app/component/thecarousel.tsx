import { imgSrc } from "@/lib/queries";
import type { Slide } from "@/lib/content";

export default function TheCarousel({ slides }: { slides: Slide[] }) {
  if (slides.length === 0) return null;
  const many = slides.length > 1;

  return (
    <section id="beranda">
      <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">
        {many && (
          <div className="carousel-indicators">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide-to={i}
                className={i === 0 ? "active" : undefined}
                aria-current={i === 0 ? "true" : undefined}
                aria-label={`Slide ${i + 1}`}
              ></button>
            ))}
          </div>
        )}

        <div className="carousel-inner">
          {slides.map((s, i) => (
            <div key={s.id} className={`carousel-item kn-carousel-item${i === 0 ? " active" : ""}`}>
              <img src={imgSrc(s.img)} className="d-block w-100" alt={s.title} />
              <div className="kn-carousel-overlay d-flex align-items-center justify-content-center text-center">
                <div className="container">
                  <h1 className="display-4 fw-bold text-white mb-3">{s.title}</h1>
                  <p className="lead text-white-50 mb-4">{s.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {many && (
          <>
            <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </>
        )}
      </div>
    </section>
  );
}
