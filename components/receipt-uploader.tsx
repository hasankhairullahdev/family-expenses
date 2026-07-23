"use client";

import * as React from "react";
import { ImagePlus, Scan, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export type OcrResult = {
  total: number;
  date: string;
  merchant: string;
  items: { name: string; price: number; qty: number }[];
  confidence: number;
};

type Props = {
  onUseData: (data: OcrResult) => void;
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ReceiptUploader({ onUseData }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [scanning, setScanning] = React.useState(false);
  const [ocrResult, setOcrResult] = React.useState<OcrResult | null>(null);
  const [ocrError, setOcrError] = React.useState<string | null>(null);

  function resetState() {
    setPreview(null);
    setFile(null);
    setFileError(null);
    setOcrResult(null);
    setOcrError(null);
    setScanning(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleFile(incoming: File) {
    setOcrResult(null);
    setOcrError(null);
    setFileError(null);

    if (!ACCEPTED.includes(incoming.type)) {
      setFileError("Format tidak didukung. Gunakan JPG, PNG, WEBP, atau HEIC.");
      return;
    }
    if (incoming.size > MAX_SIZE) {
      setFileError("Ukuran file terlalu besar. Maksimal 5 MB.");
      return;
    }

    setFile(incoming);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(incoming);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  async function handleScan() {
    if (!file) return;
    setScanning(true);
    setOcrError(null);
    setOcrResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setOcrError(json.error ?? "Terjadi kesalahan saat memproses struk.");
        return;
      }

      setOcrResult(json as OcrResult);
    } catch {
      setOcrError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      {!preview && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 px-4 cursor-pointer transition-all select-none",
            dragging
              ? "border-gold-400 bg-gold-400/5 scale-[1.01]"
              : "border-maroon-600/60 bg-surface-950/60 hover:border-maroon-500 hover:bg-maroon-900/10"
          )}
        >
          <ImagePlus
            className={cn(
              "w-10 h-10 transition-colors",
              dragging ? "text-gold-400" : "text-maroon-400"
            )}
            strokeWidth={1.5}
          />
          <div className="text-center">
            <p className="text-sm font-medium text-surface-100">
              {dragging ? "Lepaskan untuk upload" : "Drag & drop atau klik untuk pilih gambar"}
            </p>
            <p className="text-xs text-surface-100/40 mt-1">JPG, PNG, WEBP, HEIC · Maks. 5 MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* File error */}
      {fileError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-900/20 border border-red-700/30 px-3 py-2 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fileError}
        </div>
      )}

      {/* Preview + scan controls */}
      {preview && (
        <div className="flex flex-col gap-3">
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-surface-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview struk"
              className={cn(
                "w-full max-h-64 object-contain",
                scanning && "brightness-75"
              )}
            />
            {/* Scan shimmer overlay */}
            {scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30">
                <div className="w-40 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent animate-pulse" />
                <p className="text-xs font-medium text-gold-300 mt-2 tracking-wide">
                  Sedang membaca struk…
                </p>
              </div>
            )}
            {/* Remove button */}
            {!scanning && (
              <button
                type="button"
                onClick={resetState}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-surface-100/70 hover:text-white hover:bg-black/80 transition-colors"
                aria-label="Hapus gambar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Scan button */}
          {!ocrResult && !scanning && (
            <Button
              type="button"
              onClick={handleScan}
              className="bg-maroon-700 hover:bg-maroon-600 text-white border-0 gap-2"
            >
              <Scan className="w-4 h-4" />
              Scan Struk
            </Button>
          )}

          {/* Scanning spinner feedback */}
          {scanning && (
            <div className="flex items-center justify-center gap-2 text-sm text-gold-300 py-1">
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              Sedang membaca struk…
            </div>
          )}
        </div>
      )}

      {/* OCR error */}
      {ocrError && (
        <div className="flex items-start gap-2 rounded-lg bg-red-900/20 border border-red-700/30 px-3 py-2.5 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{ocrError}</span>
        </div>
      )}

      {/* OCR result card */}
      {ocrResult && (
        <div className="flex flex-col gap-3 rounded-xl border border-gold-400/30 bg-gold-400/5 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gold-300">
            <CheckCircle2 className="w-4 h-4" />
            Struk berhasil dibaca
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <span className="text-surface-100/50">Merchant</span>
            <span className="text-surface-50 font-medium truncate">
              {ocrResult.merchant || "—"}
            </span>
            <span className="text-surface-100/50">Tanggal</span>
            <span className="text-surface-50 font-medium">{ocrResult.date || "—"}</span>
            <span className="text-surface-100/50">Total</span>
            <span className="text-gold-300 font-bold text-base">
              {formatRupiah(ocrResult.total)}
            </span>
          </div>
          {ocrResult.items.length > 0 && (
            <div className="mt-1 border-t border-white/10 pt-2">
              <p className="text-xs text-surface-100/40 mb-1.5">Item ({ocrResult.items.length})</p>
              <ul className="flex flex-col gap-1">
                {ocrResult.items.slice(0, 4).map((item, i) => (
                  <li key={i} className="flex justify-between text-xs text-surface-100/70">
                    <span className="truncate mr-2">
                      {item.qty > 1 ? `${item.qty}× ` : ""}{item.name}
                    </span>
                    <span className="shrink-0 text-surface-100/50">
                      {formatRupiah(item.price * item.qty)}
                    </span>
                  </li>
                ))}
                {ocrResult.items.length > 4 && (
                  <li className="text-xs text-surface-100/30 italic">
                    +{ocrResult.items.length - 4} item lainnya
                  </li>
                )}
              </ul>
            </div>
          )}
          <Button
            type="button"
            onClick={() => onUseData(ocrResult)}
            className="mt-1 bg-gold-500 hover:bg-gold-400 text-black font-semibold border-0 gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Gunakan Data Ini
          </Button>
        </div>
      )}
    </div>
  );
}
