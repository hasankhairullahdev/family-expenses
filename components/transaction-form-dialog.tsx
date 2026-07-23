"use client";

import * as React from "react";
type TransactionType = "INCOME" | "EXPENSE";
import {
  createTransaction,
  updateTransaction,
  type TransactionFormData,
  type TransactionWithRelations,
} from "@/app/actions/transaction";
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
import { ReceiptUploader, type OcrResult } from "@/components/receipt-uploader";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
};

type Props = {
  transaction?: TransactionWithRelations;
  allCategories: Category[];
  trigger?: React.ReactNode;
  onSuccess?: () => void;
};

function toDateInputValue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function todayInputValue(): string {
  return toDateInputValue(new Date());
}

type InputMode = "manual" | "scan";

export function TransactionFormDialog({
  transaction,
  allCategories,
  trigger,
  onSuccess,
}: Props) {
  const isEdit = Boolean(transaction);
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [inputMode, setInputMode] = React.useState<InputMode>("manual");

  const [type, setType] = React.useState<TransactionType>(
    transaction?.type ?? "EXPENSE"
  );
  const [amount, setAmount] = React.useState(
    transaction ? String(transaction.amount) : ""
  );
  const [categoryId, setCategoryId] = React.useState(
    transaction?.categoryId ?? ""
  );
  const [date, setDate] = React.useState(
    transaction ? toDateInputValue(transaction.date) : todayInputValue()
  );
  const [description, setDescription] = React.useState(
    transaction?.description ?? ""
  );

  const filteredCategories = allCategories.filter((c) => c.type === type);

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) return;
    if (isEdit && transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setCategoryId(transaction.categoryId);
      setDate(toDateInputValue(transaction.date));
      setDescription(transaction.description ?? "");
    } else {
      setType("EXPENSE");
      setAmount("");
      setCategoryId("");
      setDate(todayInputValue());
      setDescription("");
    }
    setError(null);
    setInputMode("manual");
  }

  function handleOcrData(data: OcrResult) {
    if (data.total) setAmount(String(data.total));
    if (data.date) setDate(data.date);
    if (data.merchant) setDescription(data.merchant);
    setInputMode("manual");
  }

  function handleTypeChange(newType: TransactionType) {
    setType(newType);
    const stillValid = allCategories.find(
      (c) => c.id === categoryId && c.type === newType
    );
    if (!stillValid) setCategoryId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Nominal harus lebih dari 0.");
      return;
    }
    if (!categoryId) {
      setError("Kategori wajib dipilih.");
      return;
    }
    if (!date) {
      setError("Tanggal wajib diisi.");
      return;
    }

    const data: TransactionFormData = { type, amount: parsedAmount, description, date, categoryId };

    setPending(true);
    try {
      if (isEdit && transaction) {
        await updateTransaction(transaction.id, data);
      } else {
        await createTransaction(data);
      }
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
      <DialogTrigger render={trigger as React.ReactElement ?? <span />}>
        {!trigger && (
          <Button className="bg-maroon-600 hover:bg-maroon-700 text-white border-0 h-9 px-4 gap-2 shadow-sm">
            <span className="text-base leading-none">+</span>
            Tambah Transaksi
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md bg-white border-cream-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-warm-900 font-heading">
            {isEdit ? "Edit Transaksi" : "Tambah Transaksi Baru"}
          </DialogTitle>
        </DialogHeader>

        {/* Mode toggle */}
        {!isEdit && (
          <div className="flex rounded-xl border border-cream-200 overflow-hidden bg-cream-50 p-1 gap-1 mt-1">
            {(["manual", "scan"] as InputMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setInputMode(m)}
                className={cn(
                  "flex-1 h-8 rounded-lg text-sm font-medium transition-all",
                  inputMode === m
                    ? "bg-maroon-600 text-white shadow-sm"
                    : "text-warm-500 hover:text-warm-800 hover:bg-cream-100"
                )}
              >
                {m === "manual" ? "✏️ Manual" : "📷 Scan Struk"}
              </button>
            ))}
          </div>
        )}

        {/* Scan Struk mode */}
        {inputMode === "scan" && !isEdit && (
          <div className="mt-1">
            <ReceiptUploader onUseData={handleOcrData} />
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={cn("mt-1 flex flex-col gap-4", inputMode === "scan" && !isEdit && "hidden")}
        >
          {/* Tipe toggle */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-warm-700 text-xs font-semibold uppercase tracking-wider">Tipe</Label>
            <div className="flex rounded-xl border border-cream-200 overflow-hidden bg-cream-50 p-1 gap-1">
              {(["EXPENSE", "INCOME"] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={cn(
                    "flex-1 h-8 rounded-lg text-sm font-medium transition-all",
                    type === t
                      ? t === "INCOME"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-maroon-600 text-white shadow-sm"
                      : "text-warm-500 hover:text-warm-800 hover:bg-cream-100"
                  )}
                >
                  {t === "INCOME" ? "🟢 Pemasukan" : "🔴 Pengeluaran"}
                </button>
              ))}
            </div>
          </div>

          {/* Nominal */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="trx-amount" className="text-warm-700 text-xs font-semibold uppercase tracking-wider">
              Nominal <span className="text-maroon-600">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-400 pointer-events-none select-none font-medium">
                Rp
              </span>
              <Input
                id="trx-amount"
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="bg-cream-50 border-cream-200 text-warm-900 placeholder:text-warm-300 focus-visible:border-maroon-600 focus-visible:ring-maroon-600/20 pl-9"
                autoFocus
              />
            </div>
          </div>

          {/* Kategori */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="trx-category" className="text-warm-700 text-xs font-semibold uppercase tracking-wider">
              Kategori <span className="text-maroon-600">*</span>
            </Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
              <SelectTrigger className="w-full bg-cream-50 border-cream-200 text-warm-800">
                <SelectValue placeholder="Pilih kategori…">
                  {categoryId
                    ? (() => {
                        const cat = filteredCategories.find((c) => c.id === categoryId);
                        return cat ? `${cat.icon} ${cat.name}` : "Pilih kategori…";
                      })()
                    : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border-cream-200 shadow-lg">
                {filteredCategories.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-warm-400 text-center">
                    Belum ada kategori {type === "INCOME" ? "pemasukan" : "pengeluaran"}.
                  </div>
                ) : (
                  filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-warm-800 hover:bg-cream-50">
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Tanggal */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="trx-date" className="text-warm-700 text-xs font-semibold uppercase tracking-wider">
              Tanggal <span className="text-maroon-600">*</span>
            </Label>
            <Input
              id="trx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-cream-50 border-cream-200 text-warm-800 focus-visible:border-maroon-600 focus-visible:ring-maroon-600/20"
            />
          </div>

          {/* Deskripsi */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="trx-desc" className="text-warm-700 text-xs font-semibold uppercase tracking-wider">
              Deskripsi <span className="text-warm-400 text-xs font-normal normal-case">(opsional)</span>
            </Label>
            <textarea
              id="trx-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan tambahan…"
              className="w-full rounded-lg border border-cream-200 bg-cream-50 px-3 py-2 text-sm text-warm-800 placeholder:text-warm-300 resize-none outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-600/20 transition-colors"
            />
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
              {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Tambah Transaksi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
