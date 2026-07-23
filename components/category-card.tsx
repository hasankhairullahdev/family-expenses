"use client";

import * as React from "react";
import { TransactionType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryFormDialog } from "@/components/category-form-dialog";
import { DeleteCategoryDialog } from "@/components/delete-category-dialog";
import { PencilIcon, Trash2Icon } from "lucide-react";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isDefault: boolean;
};

export function CategoryCard({ category }: { category: Category }) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  return (
    <div className="group relative flex items-center gap-3 rounded-xl border border-cream-200 bg-white p-3.5 transition-colors hover:border-cream-300 hover:bg-cream-50 shadow-sm">
      {/* Color swatch + Icon */}
      <div
        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl border border-cream-100"
        style={{ backgroundColor: `${category.color}18` }}
      >
        {category.icon}
      </div>

      {/* Name + badges */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-warm-800 truncate">
          {category.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border border-warm-100 flex-shrink-0"
            style={{ background: category.color }}
          />
          {category.isDefault && (
            <Badge
              variant="outline"
              className="h-4 text-[10px] px-1.5 border-gold-500/40 text-gold-600 bg-gold-50"
            >
              Default
            </Badge>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {!category.isDefault && (
        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <CategoryFormDialog
            category={category}
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-warm-400 hover:text-warm-700 hover:bg-cream-100"
                title="Edit kategori"
              >
                <PencilIcon />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-warm-400 hover:text-red-600 hover:bg-red-50"
            title="Hapus kategori"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2Icon />
          </Button>
        </div>
      )}

      <DeleteCategoryDialog
        categoryId={category.id}
        categoryName={category.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
