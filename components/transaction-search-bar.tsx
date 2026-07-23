"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";

type Props = {
  current: string;
};

export function SearchBar({ current }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = React.useState(current);

  React.useEffect(() => {
    setValue(current);
  }, [current]);

  function buildUrl(search: string | undefined) {
    const p = new URLSearchParams(searchParams.toString());
    if (search) p.set("search", search);
    else p.delete("search");
    return `/transaksi${p.size ? `?${p}` : ""}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl(value.trim() || undefined));
  }

  function handleClear() {
    setValue("");
    router.push(buildUrl(undefined));
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-sm mb-4">
      <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-300 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari transaksi berdasarkan deskripsi…"
        className="w-full h-9 rounded-lg border border-cream-200 bg-white pl-8 pr-8 text-sm text-warm-800 placeholder:text-warm-300 focus:outline-none focus:border-maroon-600 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-300 hover:text-warm-600 transition-colors leading-none"
          title="Hapus pencarian"
        >
          ✕
        </button>
      )}
    </form>
  );
}
