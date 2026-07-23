"use client";

import * as React from "react";
import { deleteCategory } from "@/app/actions/category";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  categoryId: string;
  categoryName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteCategoryDialog({ categoryId, categoryName, open, onOpenChange }: Props) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleDelete() {
    setPending(true);
    setError(null);
    try {
      await deleteCategory(categoryId);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setPending(false);
    }
  }

  function handleOpenChange(val: boolean) {
    if (!val) setError(null);
    onOpenChange(val);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm bg-white border-cream-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-warm-900 font-heading">Hapus Kategori?</DialogTitle>
          <DialogDescription className="text-warm-500">
            Kamu yakin ingin menghapus kategori{" "}
            <span className="font-semibold text-warm-800">{categoryName}</span>?{" "}
            Tindakan ini tidak bisa dibatalkan.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-maroon-700 bg-maroon-50 border border-maroon-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
            className="border-cream-200 text-warm-700 hover:bg-cream-50"
          >
            Batal
          </Button>
          <Button
            onClick={handleDelete}
            disabled={pending}
            className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm"
          >
            {pending ? "Menghapus…" : "Ya, Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
