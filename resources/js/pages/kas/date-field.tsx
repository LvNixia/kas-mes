import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { C } from './shared';

const MONTHS = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

const MONTHS_SHORT = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
];

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

type Parts = { y: number; m: number; d: number };

/** Parses `YYYY-MM-DD` without going through Date, which would shift by timezone. */
function parse(value: string): Parts | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
        return null;
    }

    return { y: +match[1], m: +match[2] - 1, d: +match[3] };
}

function iso({ y, m, d }: Parts): string {
    return (
        String(y).padStart(4, '0') +
        '-' +
        String(m + 1).padStart(2, '0') +
        '-' +
        String(d).padStart(2, '0')
    );
}

function todayParts(): Parts {
    const now = new Date();

    return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
}

function label(value: string, placeholder: string): string {
    const parts = parse(value);

    return parts
        ? parts.d + ' ' + MONTHS_SHORT[parts.m] + ' ' + parts.y
        : placeholder;
}

type Cell = {
    key: string;
    day: number;
    month: number;
    year: number;
    muted: boolean;
};

/** Six weeks of cells so the grid never changes height between months. */
function buildGrid(year: number, month: number): Cell[] {
    const firstWeekday = new Date(year, month, 1).getDay();
    const start = new Date(year, month, 1 - firstWeekday);
    const cells: Cell[] = [];

    for (let i = 0; i < 42; i++) {
        const date = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate() + i,
        );

        cells.push({
            key: date.toDateString(),
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear(),
            muted: date.getMonth() !== month,
        });
    }

    return cells;
}

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    /** Smaller trigger, used by the riwayat filters. */
    compact?: boolean;
    /** Allow clearing back to an empty value. */
    clearable?: boolean;
    ariaLabel?: string;
};

/**
 * Theme-matched replacement for `<input type="date">`. The native picker cannot
 * be styled, so the whole control is rendered here and emits the same
 * `YYYY-MM-DD` strings the rest of the app already works with.
 */
export default function DateField({
    value,
    onChange,
    placeholder = 'Pilih tanggal',
    compact = false,
    clearable = false,
    ariaLabel,
}: Props) {
    const [open, setOpen] = useState(false);
    const today = useMemo(() => todayParts(), []);
    const selected = parse(value);
    const [view, setView] = useState(() => ({
        y: selected?.y ?? today.y,
        m: selected?.m ?? today.m,
    }));
    const wrapper = useRef<HTMLDivElement | null>(null);
    const popupId = useId();

    /** Always reopen on the month that is currently selected. */
    const toggle = () => {
        setOpen((wasOpen) => {
            if (!wasOpen) {
                const base = parse(value) ?? today;
                setView({ y: base.y, m: base.m });
            }

            return !wasOpen;
        });
    };

    useEffect(() => {
        if (!open) {
            return;
        }

        const onPointerDown = (e: PointerEvent) => {
            if (!wrapper.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const cells = useMemo(() => buildGrid(view.y, view.m), [view]);

    const years = useMemo(() => {
        const from = Math.min(today.y - 8, selected?.y ?? today.y);
        const to = Math.max(today.y + 2, selected?.y ?? today.y);

        return Array.from({ length: to - from + 1 }, (_, i) => from + i);
    }, [today.y, selected?.y]);

    const shift = (by: number) => {
        setView((v) => {
            const next = new Date(v.y, v.m + by, 1);

            return { y: next.getFullYear(), m: next.getMonth() };
        });
    };

    const pick = (cell: Cell) => {
        onChange(iso({ y: cell.year, m: cell.month, d: cell.day }));
        setOpen(false);
    };

    const navBtn: React.CSSProperties = {
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(30,39,73,.12)',
        borderRadius: 8,
        background: '#fff',
        color: 'rgba(30,39,73,.6)',
        fontSize: 14,
        lineHeight: 1,
        cursor: 'pointer',
    };

    const selectStyle: React.CSSProperties = {
        border: '1px solid rgba(30,39,73,.12)',
        borderRadius: 8,
        background: '#fff',
        padding: '5px 6px',
        fontSize: 12.5,
        fontWeight: 600,
        color: C.navy,
        cursor: 'pointer',
    };

    return (
        <div ref={wrapper} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={toggle}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? popupId : undefined}
                aria-label={ariaLabel}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: compact ? 10 : 12,
                    border: `1px solid ${open ? C.teal : 'rgba(30,39,73,.14)'}`,
                    borderRadius: 11,
                    background: C.paper,
                    fontSize: compact ? 13 : 14,
                    fontWeight: 500,
                    color: value ? C.navy : 'rgba(30,39,73,.45)',
                    textAlign: 'left',
                    cursor: 'pointer',
                }}
            >
                {label(value, placeholder)}
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                >
                    <rect
                        x="1.5"
                        y="2.75"
                        width="13"
                        height="11.75"
                        rx="2.5"
                        fill="none"
                        stroke="rgba(30,39,73,.45)"
                        strokeWidth="1.3"
                    />
                    <path
                        d="M1.5 6.25h13M5 1.5v2.5M11 1.5v2.5"
                        stroke="rgba(30,39,73,.45)"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                    />
                </svg>
            </button>

            {open && (
                <div
                    id={popupId}
                    role="dialog"
                    aria-label="Pilih tanggal"
                    style={{
                        position: 'absolute',
                        zIndex: 70,
                        top: 'calc(100% + 6px)',
                        left: 0,
                        minWidth: 262,
                        maxWidth: 'calc(100vw - 32px)',
                        background: '#fff',
                        border: '1px solid rgba(30,39,73,.1)',
                        borderRadius: 14,
                        boxShadow: '0 16px 40px rgba(30,39,73,.16)',
                        padding: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        animation: 'rise .16s ease both',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 6,
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => shift(-1)}
                            aria-label="Bulan sebelumnya"
                            style={navBtn}
                        >
                            ‹
                        </button>
                        <div style={{ display: 'flex', gap: 5 }}>
                            <select
                                value={view.m}
                                onChange={(e) =>
                                    setView((v) => ({
                                        ...v,
                                        m: +e.target.value,
                                    }))
                                }
                                aria-label="Bulan"
                                style={selectStyle}
                            >
                                {MONTHS.map((name, i) => (
                                    <option key={name} value={i}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={view.y}
                                onChange={(e) =>
                                    setView((v) => ({
                                        ...v,
                                        y: +e.target.value,
                                    }))
                                }
                                aria-label="Tahun"
                                style={selectStyle}
                            >
                                {years.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={() => shift(1)}
                            aria-label="Bulan berikutnya"
                            style={navBtn}
                        >
                            ›
                        </button>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7,1fr)',
                            gap: 2,
                        }}
                    >
                        {WEEKDAYS.map((d) => (
                            <span
                                key={d}
                                style={{
                                    textAlign: 'center',
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    letterSpacing: '.04em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(30,39,73,.4)',
                                    paddingBottom: 2,
                                }}
                            >
                                {d}
                            </span>
                        ))}

                        {cells.map((cell) => {
                            const isSelected =
                                !!selected &&
                                selected.y === cell.year &&
                                selected.m === cell.month &&
                                selected.d === cell.day;
                            const isToday =
                                today.y === cell.year &&
                                today.m === cell.month &&
                                today.d === cell.day;

                            return (
                                <button
                                    key={cell.key}
                                    type="button"
                                    className="kas-day"
                                    onClick={() => pick(cell)}
                                    aria-current={isToday ? 'date' : undefined}
                                    style={{
                                        height: 32,
                                        border: isToday
                                            ? `1px solid ${C.teal}`
                                            : '1px solid transparent',
                                        borderRadius: 9,
                                        background: isSelected
                                            ? C.navy
                                            : 'transparent',
                                        fontSize: 12.5,
                                        fontWeight:
                                            isSelected || isToday ? 700 : 500,
                                        color: isSelected
                                            ? C.cream
                                            : cell.muted
                                              ? 'rgba(30,39,73,.28)'
                                              : isToday
                                                ? C.teal
                                                : C.navy,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {cell.day}
                                </button>
                            );
                        })}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                            paddingTop: 8,
                            borderTop: '1px solid rgba(30,39,73,.08)',
                        }}
                    >
                        {clearable ? (
                            <button
                                type="button"
                                onClick={() => {
                                    onChange('');
                                    setOpen(false);
                                }}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    padding: 0,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: C.red,
                                    cursor: 'pointer',
                                }}
                            >
                                Hapus
                            </button>
                        ) : (
                            <span />
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                onChange(iso(today));
                                setOpen(false);
                            }}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                padding: 0,
                                fontSize: 12,
                                fontWeight: 600,
                                color: C.teal,
                                cursor: 'pointer',
                            }}
                        >
                            Hari ini
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
