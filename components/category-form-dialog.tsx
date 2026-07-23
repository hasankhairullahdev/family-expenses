"use client";

import * as React from "react";
type TransactionType = "INCOME" | "EXPENSE";
import { createCategory, updateCategory, type CategoryFormData } from "@/app/actions/category";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const EMOJI_OPTIONS = [
  "🍔","🛒","🚗","🏠","💊","🎬","📚","✈️","🎮","👕",
  "☕","🍕","💇","🏋️","🐶","🎁","💡","📱","🧹","🏥",
  "💰","💵","💼","📈","🎯","🌟","⭐","💎","🏆","🎪",
];

const COLOR_PRESETS = [
  { label: "Maroon",  value: "#9B1C1C" },
  { label: "Gold",    value: "#D4AF37" },
  { label: "Navy",    value: "#1E3A5F" },
  { label: "Forest",  value: "#1A5C2A" },
  { label: "Purple",  value: "#5B21B6" },
  { label: "Teal",    value: "#0F766E" },
  { label: "Orange",  value: "#C2410C" },
  { label: "Slate",   value: "#475569" },
];

type CategoryData = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
};

type Props = {
  category?: CategoryData;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
};

export function CategoryFormDialog({ category, trigger, onSuccess }: Props) {
  const isEdit = Boolean(category);
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState(category?.name ?? "");
  const [icon, setIcon] = React.useState(category?.icon ?? "💰");
  const [color, setColor] = React.useState(category?.color ?? "#9B1C1C");
  const [type, setType] = React.useState<TransactionType>(category?.type ?? "EXPENSE");

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) return;
    if (!isEdit) {
      setName(""); setIcon("💰"); setColor("#9B1C1C"); setType("EXPENSE");
    } else {
      setName(category!.name); setIcon(category!.icon);
      setColor(category!.color); setType(category!.type);
    }
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || name.trim().length < 2) {
      setError("Nama kategori minimal 2 karakter.");
      return;
    }
    const data: CategoryFormData = { name, icon, color, type };
    setPending(true);
    try {
      if (isEdit && category) await updateCategory(category.id, data);
      else await createCategory(data);
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger ? (trigger as React.ReactElement) : <button />}>
        {!trigger && (
          <Button className="bg-maroon-600 hover:bg-maroon-700 text-white border-0 h-9 px-4 gap-2 shadow-sm">
            <span className="text-base leading-none">+</span>
            Tambah Kategori
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md bg-white border-cream-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-warm-900 font-heading">
            {isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-4">
          {/* Nama */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-name" className="text-warm-700 text-xs font-semibold uppercase tracking-wider">
              Nama <span className="text-maroon-600">*</span>
            </Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="mis. Belanja Mingguan"
              className="bg-cream-50 border-cream-200 text-warm-900 placeholder:text-warm-300 focus-visible:border-maroon-600 focus-visible:ring-maroon-600/20"
              autoFocus
            />
          </div>

          {/* Tipe */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-warm-700 text-xs font-semibold uppercase tracking-wider">Tipe</Label>
            <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
              <SelectTrigger className="w-full bg-cream-50 border-cream-200 text-warm-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-cream-200 shadow-lg">
                <SelectItem value="EXPENSE" className="text-warm-800">🔴 Pengeluaran</SelectItem>
                <SelectItem value="INCOME" className="text-warm-800">🟢 Pemasukan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Icon picker */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-warm-700 text-xs font-semibold uppercase tracking-wider">
              Icon — <span className="text-xl normal-case">{icon}</span>
            </Label>
            <div className="grid grid-cols-10 gap-1 p-2 rounded-xl border border-cream-200 bg-cream-50">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className={cn(
                    "text-xl leading-none flex items-center justify-center rounded-lg aspect-square transition-colors",
                    icon === e
                      ? "bg-maroon-100 ring-2 ring-maroon-400"
                      : "hover:bg-cream-200"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-warm-700 text-xs font-semibold uppercase tracking-wider">
              Warna —{" "}
              <span
                className="inline-block w-4 h-4 rounded-full border border-warm-200 align-middle"
                style={{ background: color }}
              />
            </Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-transform",
                    color === c.value
                      ? "border-warm-800 scale-110 shadow-md"
                      : "border-transparent hover:scale-105 border-warm-200"
                  )}
                  style={{ background: c.value }}
                />
              ))}
              <label
                title="Warna custom"
                className="w-8 h-8 rounded-full border-2 border-dashed border-warm-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-warm-500"
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="opacity-0 absolute w-px h-px"
                />
                <span className="text-xs text-warm-400">+</span>
              </label>
            </div>
          </div>

          {error && (
            <p className="text-sm text-maroon-700 bg-maroon-50 border border-maroon-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={pending}
              className="bg-maroon-600 hover:bg-maroon-700 text-white border-0 shadow-sm"
            >
              {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Tambah Kategori"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
