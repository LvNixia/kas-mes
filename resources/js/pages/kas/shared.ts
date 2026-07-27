import { useSyncExternalStore } from 'react';

export type Jenis = 'masuk' | 'keluar';

export type Tx = {
    id: number;
    tgl: string;
    tgl_label: string;
    tgl_full: string;
    jenis: Jenis;
    kategori: string;
    nominal: number;
    keterangan: string | null;
    bukti_nama: string | null;
    bukti_url: string | null;
};

export type Cat = { id: number; nama: string; info: string | null };

export type Bar = { key: string; label: string; masuk: number; keluar: number };

export type ReportRow = {
    label: string;
    masuk: number;
    keluar: number;
    selisih: number;
    n: number;
};

export type Period = 'harian' | 'bulanan' | 'tahunan';

export type Filters = {
    q: string;
    jenis: 'semua' | 'masuk' | 'keluar' | 'bulan';
    kategori: string;
    from: string | null;
    to: string | null;
};

export type KasPageProps = {
    settings: {
        nama_mes: string;
        alamat: string | null;
        telp: string | null;
        nama_user: string;
        email: string;
        today: string;
    };
    categories: { masuk: Cat[]; keluar: Cat[] };
    summary: { masuk: number; keluar: number; saldo: number };
    counts: { masuk: number; keluar: number };
    bars: Bar[];
    recent: Tx[];
    period: Period;
    report: ReportRow[];
    reportTotal: { n: number; masuk: number; keluar: number; selisih: number };
    filters: Filters;
    total: number;
    transactions: { data: Tx[]; meta: { total: number } };
    flash?: { success?: string | null; error?: string | null };
};

/** Palette lifted straight from the design file. */
export const C = {
    navy: '#1e2749',
    cream: '#f6f2ea',
    amber: '#f0b84e',
    teal: '#2f7a68',
    tealDark: '#1a3f5c',
    red: '#b8471f',
    rust: '#d1673f',
    rustDark: '#9c4726',
    orange: '#f0a878',
    paper: '#faf9f6',
    stone: '#e3e1da',
};

/** Keep the active page and form state alive across write requests. */
export const mutationOptions = {
    preserveState: true,
    preserveScroll: true,
} as const;

export function rp(n: number): string {
    return 'Rp ' + Math.round(Math.abs(Number(n) || 0)).toLocaleString('id-ID');
}

export function signed(n: number): string {
    return (n < 0 ? '− ' : '') + rp(n);
}

export function digits(v: string): number {
    return Number(String(v).replace(/[^0-9]/g, '')) || 0;
}

export function group(n: number): string {
    return n ? n.toLocaleString('id-ID') : '';
}

export function todayIso(): string {
    return new Date().toISOString().slice(0, 10);
}

export type Deco = {
    sign: string;
    tagBg: string;
    tagFg: string;
    amtColor: string;
    amt: string;
    jenisLabel: string;
};

export function deco(t: Pick<Tx, 'jenis' | 'nominal'>): Deco {
    const masuk = t.jenis === 'masuk';

    return {
        sign: masuk ? '+' : '−',
        tagBg: masuk ? 'rgba(47,122,104,.1)' : 'rgba(200,121,79,.16)',
        tagFg: masuk ? C.teal : C.rustDark,
        amtColor: masuk ? C.teal : C.red,
        jenisLabel: masuk ? 'Pemasukan' : 'Pengeluaran',
        amt: (masuk ? '+ ' : '− ') + rp(t.nominal),
    };
}

/** Scale each month to the tallest bar in the window. */
export function barHeights(bars: Bar[], floor = 3) {
    const peak = Math.max(1, ...bars.map((b) => Math.max(b.masuk, b.keluar)));

    return bars.map((b) => ({
        key: b.key,
        label: b.label,
        hIn: Math.max(floor, Math.round((b.masuk / peak) * 100)),
        hOut: Math.max(floor, Math.round((b.keluar / peak) * 100)),
    }));
}

const DESKTOP_QUERY = '(min-width: 1024px)';

function subscribe(onChange: () => void): () => void {
    const mql = window.matchMedia(DESKTOP_QUERY);
    mql.addEventListener('change', onChange);

    return () => mql.removeEventListener('change', onChange);
}

/**
 * Picks the desktop layout above 1024px. Falls back to the mobile layout
 * during SSR, where no viewport width is known yet.
 */
export function useIsDesktop(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(DESKTOP_QUERY).matches,
        () => false,
    );
}
