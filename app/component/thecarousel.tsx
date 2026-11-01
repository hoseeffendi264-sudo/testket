"use client";

export default function TheCarousel() {
    return (
      <section id="beranda">
        <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-indicators">
            <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
            <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
            <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
          </div>

          <div className="carousel-inner">
            <div className="carousel-item active kn-carousel-item">
              <img src="img/carousel1.jpg" className="d-block w-100" alt="Carousel 1" />
              <div className="kn-carousel-overlay d-flex align-items-center justify-content-center text-center">
                <div className="container">
                  <h1 className="display-4 fw-bold text-white mb-3">Cita Rasa Nusantara</h1>
                  <p className="lead text-white-50 mb-4">Nikmati makanan dan minuman terbaik dari berbagai penjuru Indonesia</p>
                </div>
              </div>
            </div>
            <div className="carousel-item kn-carousel-item">
              <img src="img/carousel2.jpg" className="d-block w-100" alt="Carousel 2" />
              <div className="kn-carousel-overlay d-flex align-items-center justify-content-center text-center">
                <div className="container">
                  <h1 className="display-4 fw-bold text-white mb-3">Promo Spesial Bulan Ini</h1>
                  <p className="lead text-white-50 mb-4">Diskon 30% untuk semua pembelian lebih dari 2 item</p>
                </div>
              </div>
            </div>
            <div className="carousel-item kn-carousel-item">
              <img src="img/carousel3.jpg" className="d-block w-100" alt="Hero 3" />
              <div className="kn-carousel-overlay d-flex align-items-center justify-content-center text-center">
                <div className="container">
                  <h1 className="display-4 fw-bold text-white mb-3">Bahan-bahan Pilihan</h1>
                  <p className="lead text-white-50 mb-4">Dipilih dari tempat-tempat berkualitas tinggi</p>
                </div>
              </div>
            </div>
          </div>

          <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </section>
    );
}