"use client";

export default function WebFooter() {
    return (
        <footer id="kontak" className="kn-footer py-5">
            <div className="container">
            <div className="row g-4">
                <div className="col-12 col-md-4 text-center text-md-start">
                    <h5 className="fw-bold text-white mb-3">
                        <i className="bi bi-cup-hot-fill me-2"></i>Ketoprak Nusantara
                    </h5>
                    <p className="text-white-50 small">
                        Menghadirkan cita rasa ketoprak terbaik dari berbagai penjuru Nusantara ke dalam setiap piring yang kami sajikan.
                    </p>
                </div>
                <div className="col-12 col-md-4 text-center">
                    <h5 className="fw-bold text-white mb-3">Jam Operasional</h5>
                    <ul className="list-unstyled text-white-50 small">
                        <li>Senin - Minggu: 05:00AM - 00:00AM</li>
                    </ul>
                </div>
                <div className="col-12 col-md-4 text-center text-md-end">
                    <h5 className="fw-bold text-white mb-3">Hubungi Kami</h5>
                    <ul className="list-unstyled text-white-50 small">
                        <li><i className="bi bi-geo-alt-fill me-1"></i> Jl. Koprak No. 1, Jakarta Selatan</li>
                        <li><i className="bi bi-telephone-fill me-1"></i> 0812-3456-7890</li>
                        <li><i className="bi bi-envelope-fill me-1"></i> halo@ketopraknusantara.id</li>
                    </ul>
                    <div className="d-flex gap-2 justify-content-center justify-content-md-end mt-3">
                        <a href="#" className="kn-social-icon"><i className="bi bi-instagram"></i></a>
                        <a href="#" className="kn-social-icon"><i className="bi bi-tiktok"></i></a>
                        <a href="#" className="kn-social-icon"><i className="bi bi-twitter-x"></i></a>
                    </div>
                </div>
            </div>
            </div>
        </footer>
    );
}