import { needAdmin } from "@/lib/admin";
import { imgSrc } from "@/lib/queries";
import { MAX_SLIDES, getAbout, getSlides } from "@/lib/content";
import { deleteSlide, moveSlide, saveAbout, saveSlide } from "@/lib/cms-actions";
import { AdminNav } from "../ui";

export const instant = false;

const oks: Record<string, string> = {
  saved: "Slide disimpan.",
  deleted: "Slide dihapus.",
  about: "Halaman Tentang disimpan.",
};
const errs: Record<string, string> = {
  slide: "Judul slide wajib diisi.",
  about: "Judul dan paragraf pertama wajib diisi.",
  foto: "Foto harus jpg, png, atau webp dengan ukuran maksimal 3 MB.",
  nofoto: "Slide baru harus punya foto.",
  max: `Maksimal ${MAX_SLIDES} slide.`,
  min: "Minimal harus ada 1 slide.",
};

export default async function Home({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await needAdmin();
  const q = await searchParams;
  const [slides, about] = await Promise.all([getSlides(), getAbout()]);

  return (
    <>
    <AdminNav on="konten" />
    <section className="py-4 kn-section-menu min-vh-100">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <h2 className="fw-bold kn-heading mb-2">Kelola Konten</h2>
          <div className="d-flex gap-2 mb-2">
            <a href="#carousel" className="btn btn-sm btn-outline-secondary">Carousel</a>
            <a href="#tentang" className="btn btn-sm btn-outline-secondary">Tentang</a>
            <a href="/" target="_blank" rel="noreferrer" className="btn btn-sm kn-btn-primary">
              <i className="bi bi-box-arrow-up-right me-1"></i>Lihat beranda
            </a>
          </div>
        </div>

        {q.ok && oks[q.ok] && <div className="alert alert-success py-2">{oks[q.ok]}</div>}
        {q.err && errs[q.err] && <div className="alert alert-danger py-2">{errs[q.err]}</div>}

        {/* ---------- Carousel ---------- */}
        <h4 id="carousel" className="fw-bold kn-text-primary mt-4 mb-1" style={{ scrollMarginTop: "80px" }}>Carousel beranda</h4>
        <p className="text-muted small">Slide tampil di beranda sesuai urutan di bawah. Foto jpg/png/webp, maksimal 3 MB (disarankan rasio lebar, mis. 1920×800).</p>

        <div className="row g-4 mb-4">
          {slides.map((s, i) => (
            <div key={s.id} className="col-12 col-lg-6">
              <div className="kn-card-static shadow-sm p-3 h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-secondary">Slide {i + 1}</span>
                  <div className="d-flex gap-1">
                    <form action={moveSlide}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="dir" value="up" />
                      <button type="submit" className="btn btn-sm btn-outline-secondary" disabled={i === 0} title="Naikkan"><i className="bi bi-arrow-up"></i></button>
                    </form>
                    <form action={moveSlide}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="dir" value="down" />
                      <button type="submit" className="btn btn-sm btn-outline-secondary" disabled={i === slides.length - 1} title="Turunkan"><i className="bi bi-arrow-down"></i></button>
                    </form>
                  </div>
                </div>
                <img src={imgSrc(s.img)} alt={s.title} className="rounded w-100 mb-3" style={{ height: "160px", objectFit: "cover" }} />
                <form action={saveSlide}>
                  <input type="hidden" name="id" value={s.id} />
                  <div className="mb-2">
                    <label className="form-label small fw-bold mb-0">Judul</label>
                    <input type="text" name="title" defaultValue={s.title} maxLength={80} className="form-control form-control-sm" required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-bold mb-0">Teks</label>
                    <input type="text" name="text" defaultValue={s.text} maxLength={200} className="form-control form-control-sm" />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-bold mb-0">Ganti foto (opsional)</label>
                    <input type="file" name="foto" accept="image/jpeg,image/png,image/webp" className="form-control form-control-sm" />
                  </div>
                  <button type="submit" className="btn btn-sm kn-btn-primary mt-1">Simpan</button>
                </form>
                <form action={deleteSlide} className="mt-2">
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" className="btn btn-sm btn-outline-danger" disabled={slides.length <= 1}>Hapus</button>
                </form>
              </div>
            </div>
          ))}
        </div>

        {slides.length < MAX_SLIDES && (
          <form action={saveSlide} className="kn-card-static shadow-sm p-3 mb-5">
            <h5 className="fw-bold kn-text-primary mb-3">Tambah slide</h5>
            <div className="row g-2">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold mb-0">Judul</label>
                <input type="text" name="title" maxLength={80} className="form-control form-control-sm" required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold mb-0">Foto</label>
                <input type="file" name="foto" accept="image/jpeg,image/png,image/webp" className="form-control form-control-sm" required />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold mb-0">Teks</label>
                <input type="text" name="text" maxLength={200} className="form-control form-control-sm" />
              </div>
            </div>
            <button type="submit" className="btn kn-btn-primary mt-3">Tambah</button>
          </form>
        )}

        {/* ---------- Tentang ---------- */}
        <h4 id="tentang" className="fw-bold kn-text-primary mt-4 mb-1" style={{ scrollMarginTop: "80px" }}>Halaman Tentang</h4>
        <p className="text-muted small">Gunakan **kata** untuk menebalkan teks. Kotak statistik yang dikosongkan tidak akan ditampilkan.</p>

        <form action={saveAbout} className="kn-card-static shadow-sm p-3 mb-4">
          <div className="row g-3">
            <div className="col-12 col-lg-4">
              <img src={imgSrc(about.img)} alt={about.heading} className="rounded w-100 mb-2" style={{ height: "200px", objectFit: "cover" }} />
              <label className="form-label small fw-bold mb-0">Ganti foto (opsional)</label>
              <input type="file" name="foto" accept="image/jpeg,image/png,image/webp" className="form-control form-control-sm" />
            </div>
            <div className="col-12 col-lg-8">
              <div className="mb-2">
                <label className="form-label small fw-bold mb-0">Judul</label>
                <input type="text" name="heading" defaultValue={about.heading} maxLength={80} className="form-control form-control-sm" required />
              </div>
              <div className="mb-2">
                <label className="form-label small fw-bold mb-0">Paragraf 1</label>
                <textarea name="p1" defaultValue={about.p1} maxLength={600} rows={4} className="form-control form-control-sm" required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold mb-0">Paragraf 2</label>
                <textarea name="p2" defaultValue={about.p2} maxLength={600} rows={4} className="form-control form-control-sm" />
              </div>
              <div className="small fw-bold mb-1">Statistik</div>
              {about.stats.map((s, i) => (
                <div key={i} className="row g-2 mb-2">
                  <div className="col-4 col-md-3">
                    <input type="text" name={`sv${i}`} defaultValue={s.value} maxLength={10} placeholder="50+" aria-label={`Angka ${i + 1}`} className="form-control form-control-sm" />
                  </div>
                  <div className="col-8 col-md-9">
                    <input type="text" name={`sl${i}`} defaultValue={s.label} maxLength={40} placeholder="Keterangan" aria-label={`Keterangan ${i + 1}`} className="form-control form-control-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="btn kn-btn-primary mt-3">Simpan</button>
        </form>
      </div>
    </section>
    </>
  );
}
