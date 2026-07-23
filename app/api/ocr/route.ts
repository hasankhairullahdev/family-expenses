import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

const SYSTEM_PROMPT = `Kamu adalah asisten OCR untuk struk belanja Indonesia. 
Analisa gambar struk belanja dan ekstrak informasi berikut dalam format JSON.

Ekstrak data berikut:
- total: total pembayaran dalam angka (integer, tanpa simbol mata uang, tanpa titik/koma pemisah ribuan)
- date: tanggal transaksi dalam format YYYY-MM-DD (jika tidak ada tahun, gunakan tahun ini)
- merchant: nama toko/merchant (string, kosong jika tidak ada)
- items: array item yang dibeli, masing-masing berisi { name: string, price: number, qty: number }
- confidence: tingkat keyakinan ekstraksi dari 0.0 hingga 1.0

Aturan penting:
- Kembalikan HANYA JSON murni, tanpa markdown, tanpa teks lain
- Jika gambar BUKAN struk belanja, kembalikan: {"error": "Gambar bukan struk belanja"}
- Jika struk tidak terbaca/terlalu buram, kembalikan: {"error": "Struk tidak dapat dibaca"}
- Jika total tidak ditemukan, kembalikan: {"error": "Total tidak ditemukan pada struk"}
- Format total harus angka integer (contoh: 150000, bukan "150.000" atau "Rp 150.000")
- Untuk items, jika tidak terdeteksi itemnya, kembalikan array kosong []

Contoh output yang benar:
{
  "total": 150000,
  "date": "2025-01-15",
  "merchant": "Indomaret",
  "items": [{"name": "Indomie Goreng", "price": 3500, "qty": 2}],
  "confidence": 0.95
}`;

export async function POST(req: NextRequest) {
  // Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Layanan OCR belum dikonfigurasi. GEMINI_API_KEY tidak ditemukan." },
      { status: 503 }
    );
  }

  // Parse multipart form data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Request tidak valid. Gunakan multipart/form-data." },
      { status: 400 }
    );
  }

  const file = formData.get("image");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Field 'image' wajib ada dan berupa file gambar." },
      { status: 400 }
    );
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau HEIC.` },
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `Ukuran file terlalu besar. Maksimal 5 MB.` },
      { status: 400 }
    );
  }

  // Convert to base64
  const arrayBuffer = await file.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString("base64");

  // Call Gemini Vision API
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      {
        inlineData: {
          mimeType: file.type as string,
          data: base64Data,
        },
      },
    ]);

    const responseText = result.response.text().trim();

    // Strip markdown code fences if present
    const cleaned = responseText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Struk tidak dapat diproses. Coba foto dengan pencahayaan lebih baik." },
        { status: 422 }
      );
    }

    // If Gemini returned an error field
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 422 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[OCR] Gemini API error:", message);
    return NextResponse.json(
      { error: "Gagal menghubungi layanan OCR. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
