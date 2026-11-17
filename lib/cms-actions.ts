"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { needAdmin } from "@/lib/admin";
import { savePhoto } from "@/lib/upload";
import { MAX_SLIDES, getAbout, getSlides, setAbout, setSlides } from "@/lib/content";

const to = "/Dashboard/Konten";

function clean(v: FormDataEntryValue | null, max: number) {
  return String(v ?? "").trim().slice(0, max);
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ---------- Carousel ---------- */

export async function saveSlide(fd: FormData) {
  await needAdmin();
  const id = String(fd.get("id") ?? "");
  const title = clean(fd.get("title"), 80);
  const text = clean(fd.get("text"), 200);
  if (!title) redirect(to + "?err=slide#carousel");

  const img = await savePhoto(fd.get("foto"), "carousel", title);
  if (img === "bad") redirect(to + "?err=foto#carousel");

  const slides = await getSlides();
  if (id) {
    const i = slides.findIndex((s) => s.id === id);
    if (i < 0) redirect(to + "?err=slide#carousel");
    slides[i] = { ...slides[i], title, text, img: img ?? slides[i].img };
  } else {
    if (!img) redirect(to + "?err=nofoto#carousel");
    if (slides.length >= MAX_SLIDES) redirect(to + "?err=max#carousel");
    slides.push({ id: newId(), img, title, text });
  }

  await setSlides(slides);
  revalidatePath("/");
  redirect(to + "?ok=saved#carousel");
}

export async function deleteSlide(fd: FormData) {
  await needAdmin();
  const id = String(fd.get("id") ?? "");
  const slides = await getSlides();
  if (slides.length <= 1) redirect(to + "?err=min#carousel");

  await setSlides(slides.filter((s) => s.id !== id));
  revalidatePath("/");
  redirect(to + "?ok=deleted#carousel");
}

export async function moveSlide(fd: FormData) {
  await needAdmin();
  const id = String(fd.get("id") ?? "");
  const dir = String(fd.get("dir") ?? "") === "up" ? -1 : 1;
  const slides = await getSlides();
  const i = slides.findIndex((s) => s.id === id);
  const j = i + dir;
  if (i >= 0 && j >= 0 && j < slides.length) {
    [slides[i], slides[j]] = [slides[j], slides[i]];
    await setSlides(slides);
    revalidatePath("/");
  }
  redirect(to + "#carousel");
}

/* ---------- Tentang ---------- */

export async function saveAbout(fd: FormData) {
  await needAdmin();
  const heading = clean(fd.get("heading"), 80);
  const p1 = clean(fd.get("p1"), 600);
  const p2 = clean(fd.get("p2"), 600);
  if (!heading || !p1) redirect(to + "?err=about#tentang");

  const stats = [0, 1, 2].map((i) => ({
    value: clean(fd.get("sv" + i), 10),
    label: clean(fd.get("sl" + i), 40),
  }));

  const img = await savePhoto(fd.get("foto"), "about", heading);
  if (img === "bad") redirect(to + "?err=foto#tentang");

  const cur = await getAbout();
  await setAbout({ img: img ?? cur.img, heading, p1, p2, stats });
  revalidatePath("/");
  redirect(to + "?ok=about#tentang");
}
