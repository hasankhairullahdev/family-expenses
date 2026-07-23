/**
 * Payroll cycle utility
 *
 * Siklus gajian: tgl 24 bulan ini → tgl 23 bulan berikutnya
 * Contoh: periode "Juli 2025" = 24 Jun 2025 00:00:00 → 23 Jul 2025 23:59:59
 *
 * Konvensi parameter (month, year):
 *   month/year mengacu ke tanggal AKHIR periode (tgl 23).
 *   Jadi "periode Juli 2025" = from: 24 Jun 2025, to: 23 Jul 2025.
 */

export const PAYROLL_DAY = 24;

export type Period = {
  from: Date;
  to: Date;
  /** Label singkat, e.g. "24 Jun – 23 Jul 2025" */
  label: string;
  /** month/year dari sisi "to" (untuk URL param) */
  month: number;
  year: number;
};

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Ags", "Sep", "Okt", "Nov", "Des",
];

const MONTH_NAMES_FULL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/**
 * Hitung periode gajian berdasarkan month/year sisi "to" (tgl 23).
 * month: 1-12, year: e.g. 2025
 */
export function getPeriodRange(month: number, year: number): Period {
  // "from" = tgl 24 bulan sebelumnya
  const fromDate = new Date(year, month - 2, PAYROLL_DAY, 0, 0, 0, 0);
  // "to" = tgl 23 bulan ini
  const toDate = new Date(year, month - 1, 23, 23, 59, 59, 999);

  const fromMonth = fromDate.getMonth(); // 0-based
  const fromYear = fromDate.getFullYear();
  const toMonth = toDate.getMonth();     // 0-based
  const toYear = toDate.getFullYear();

  const label =
    fromYear === toYear
      ? `24 ${MONTH_NAMES_SHORT[fromMonth]} – 23 ${MONTH_NAMES_SHORT[toMonth]} ${toYear}`
      : `24 ${MONTH_NAMES_SHORT[fromMonth]} ${fromYear} – 23 ${MONTH_NAMES_SHORT[toMonth]} ${toYear}`;

  return { from: fromDate, to: toDate, label, month, year };
}

/**
 * Periode "sebelumnya" (mundur 1 bulan dari sisi to).
 */
export function getPrevPeriod(month: number, year: number): Period {
  const d = new Date(year, month - 2, 1);
  return getPeriodRange(d.getMonth() + 1, d.getFullYear());
}

/**
 * Periode aktif saat ini — berdasarkan tanggal hari ini.
 * Kalau hari ini >= 24, periode aktif = bulan depan (to-side).
 * Kalau hari ini < 24, periode aktif = bulan ini (to-side).
 */
export function getCurrentPeriod(timezoneOffsetHours: number = 7): Period {
  // Koreksi timezone — server berjalan di UTC, user di WIB (UTC+7)
  const now = new Date(Date.now() + timezoneOffsetHours * 60 * 60 * 1000);
  const day = now.getUTCDate();
  const month = now.getUTCMonth() + 1; // 1-based
  const year = now.getUTCFullYear();

  if (day >= PAYROLL_DAY) {
    // Sudah masuk periode baru: to-side = bulan depan
    const next = new Date(year, month, 1); // bulan depan
    return getPeriodRange(next.getMonth() + 1, next.getFullYear());
  } else {
    // Masih di periode berjalan: to-side = bulan ini
    return getPeriodRange(month, year);
  }
}

/**
 * Label panjang untuk heading, e.g. "Juli 2025"
 */
export function getPeriodLabelFull(month: number, year: number): string {
  return `${MONTH_NAMES_FULL[month - 1]} ${year}`;
}
