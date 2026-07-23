# 🚀 Deploy ke Vercel — Step by Step

## Prasyarat
- Akun [Vercel](https://vercel.com) (bisa login pakai GitHub)
- Repo sudah di-push ke GitHub: `hasankhairullahdev/family-expenses`
- Database Neon sudah jalan (sudah setup sebelumnya)

---

## Step 1 — Import Repo ke Vercel

1. Buka **[vercel.com/new](https://vercel.com/new)**
2. Klik **"Continue with GitHub"** → authorize jika diminta
3. Cari repo **`family-expenses`** → klik **Import**
4. Di halaman konfigurasi:
   - **Framework Preset**: Next.js *(auto-detected)*
   - **Root Directory**: `family-expenses-app` ⚠️ **WAJIB DIISI**
   - **Build Command**: biarkan default (`next build`)
   - **Output Directory**: biarkan default (`.next`)
5. **Jangan klik Deploy dulu** — isi env variables di Step 2 terlebih dahulu

---

## Step 2 — Set Environment Variables

Masih di halaman konfigurasi Vercel, scroll ke bawah ke bagian **"Environment Variables"**.

Tambahkan satu per satu variabel berikut:

| Name | Value |
|------|-------|
| `DATABASE_URL` | *(copy dari `.env.local` — nilai `DATABASE_URL`)* |
| `NEXTAUTH_SECRET` | `7588a28853f63c3ba0d516900a9c14ef9066ab1fd4b014db6d69c2233517a364` |
| `NEXTAUTH_URL` | *(isi setelah dapat URL Vercel — lihat Step 4)* |
| `GEMINI_API_KEY` | *(API key Google AI Studio kamu)* |
| `NEXT_PUBLIC_QUICK_USER_HASAN_EMAIL` | `hasan@family.local` |
| `NEXT_PUBLIC_QUICK_USER_HASAN_PASSWORD` | `hasan123` |
| `NEXT_PUBLIC_QUICK_USER_LIA_EMAIL` | `lia@family.local` |
| `NEXT_PUBLIC_QUICK_USER_LIA_PASSWORD` | `lia123` |

> **Catatan `NEXTAUTH_URL`**: Sementara isi dulu dengan `https://family-expenses.vercel.app`
> (atau nama subdomain yang Vercel assign). Setelah deploy selesai, update nilainya ke URL yang benar.

> **Catatan `GEMINI_API_KEY`**: Kalau belum punya, bisa dapat di
> [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) — gratis.
> Kalau skip, fitur scan struk (OCR) tidak akan berfungsi.

---

## Step 3 — Deploy

1. Klik tombol **"Deploy"**
2. Tunggu proses build selesai (~2–3 menit)
3. Jika sukses, akan muncul halaman konfetti 🎉 dengan URL app kamu

---

## Step 4 — Update NEXTAUTH_URL

Setelah deploy selesai dan dapat URL asli (contoh: `https://family-expenses-abc123.vercel.app`):

1. Buka **Vercel Dashboard** → pilih project `family-expenses`
2. Klik tab **Settings** → **Environment Variables**
3. Cari `NEXTAUTH_URL` → klik **Edit**
4. Ganti nilainya dengan URL Vercel yang benar, contoh:
   ```
   https://family-expenses-abc123.vercel.app
   ```
5. Klik **Save**
6. Klik tab **Deployments** → klik titik tiga di deployment terbaru → **Redeploy**

---

## Step 5 — Verifikasi

Buka URL app kamu di browser, pastikan:

- [ ] Halaman login muncul dengan tombol **Hasan** dan **Lia**
- [ ] Klik tombol Hasan → masuk ke dashboard
- [ ] Dashboard menampilkan data (meski masih kosong)
- [ ] Bisa tambah transaksi baru
- [ ] Bisa set budget bulanan

---

## Troubleshooting

### Build error: "Cannot find module '@prisma/client'"
Tambahkan environment variable:
```
PRISMA_GENERATE_SKIP_AUTOINSTALL=false
```
Lalu redeploy.

### Error: "NEXTAUTH_SECRET is not defined"
Pastikan `NEXTAUTH_SECRET` sudah diset di environment variables Vercel dan sudah redeploy.

### Login gagal / redirect loop
Pastikan `NEXTAUTH_URL` sudah diisi dengan URL Vercel yang benar (bukan `localhost`).

### Fitur scan struk tidak bekerja
Pastikan `GEMINI_API_KEY` sudah diisi dengan API key yang valid dari Google AI Studio.

---

## Custom Domain (Opsional)

Kalau mau pakai domain sendiri, misal `keuangan.hasanlia.com`:

1. Vercel Dashboard → Settings → **Domains**
2. Klik **Add** → ketik domain kamu → **Add**
3. Ikuti instruksi DNS yang muncul (tambah CNAME record di provider domain)
4. Setelah domain aktif, update `NEXTAUTH_URL` ke domain baru
5. Redeploy

---

## Update App ke Depannya

Setiap kali ada perubahan kode, cukup:

```bash
git add .
git commit -m "pesan commit"
git push
```

Vercel akan otomatis **auto-deploy** setiap ada push ke branch `master`. 🎉
