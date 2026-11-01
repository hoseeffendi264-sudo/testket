# Langkah Deploy: Vercel + Prisma (Neon Postgres)

1. `npm install`
2. Push ke GitHub (repo baru atau yang ada).
3. vercel.com → Add New → Project → import repo.
4. Di project Vercel: Storage → Create/Connect → **Neon (Postgres)** → connect ke project.
   Otomatis menambah env `DATABASE_URL` dan `DATABASE_URL_UNPOOLED`.
5. Storage → **Blob** → create → connect (menambah `BLOB_READ_WRITE_TOKEN`, dipakai upload foto menu).
6. Settings → Environment Variables → tambah `SESSION_PASSWORD` (minimal 32 karakter acak).
7. Tarik env ke lokal: `npx vercel link` lalu `npx vercel env pull .env.local`
8. Buat tabel: `npx prisma migrate dev --name init`
9. Isi data awal: `npx prisma db seed`
   (admin@ketoprak.com / Admin123! dan user@ketoprak.com / User123!)
10. Jalankan lokal: `npm run dev`
11. Deploy: `git push` (atau `npx vercel --prod`).
