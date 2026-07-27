import { InfiniteScroll } from '@inertiajs/react';
import { useState } from 'react';
import DateField from './date-field';
import type { Cat, Jenis, Tx } from './shared';
import { C, deco, digits, group, rp, signed } from './shared';
import type { KasPage, KasState } from './use-kas';

const PAGES: { id: KasPage; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'kategori', label: 'Kategori' },
    { id: 'input', label: 'Input Transaksi' },
    { id: 'riwayat', label: 'Riwayat Transaksi' },
    { id: 'laporan', label: 'Laporan Keuangan' },
    { id: 'pengaturan', label: 'Pengaturan' },
];

const card: React.CSSProperties = {
    background: '#fff',
    border: '1px solid rgba(30,39,73,.08)',
    borderRadius: 13,
};

const field: React.CSSProperties = {
    padding: '11px 12px',
    border: '1px solid rgba(30,39,73,.16)',
    borderRadius: 8,
    background: C.paper,
    fontSize: 13.5,
    color: C.navy,
};

const smallField: React.CSSProperties = {
    ...field,
    padding: '9px 11px',
    fontSize: 13,
};

const labelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(30,39,73,.7)',
};

const filterLabel: React.CSSProperties = {
    ...labelStyle,
    fontSize: 11.5,
    color: 'rgba(30,39,73,.6)',
};

const primaryBtn: React.CSSProperties = {
    padding: '12px 20px',
    border: 'none',
    borderRadius: 9,
    background: C.teal,
    color: '#f3f6ef',
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
};

const ghostBtn: React.CSSProperties = {
    padding: '9px 14px',
    border: '1px solid rgba(30,39,73,.16)',
    borderRadius: 8,
    background: '#fff',
    fontSize: 12.5,
    fontWeight: 600,
    color: C.navy,
    cursor: 'pointer',
};

const rowBtn: React.CSSProperties = {
    border: '1px solid rgba(30,39,73,.14)',
    background: 'transparent',
    borderRadius: 7,
    padding: '5px 10px',
    fontSize: 11.5,
    fontWeight: 600,
    color: 'rgba(30,39,73,.65)',
    cursor: 'pointer',
};

const headCell: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '.06em',
    textTransform: 'uppercase',
    color: 'rgba(30,39,73,.45)',
};

const RIWAYAT_COLS = '100px 1fr 150px 120px 140px 130px';
const REPORT_COLS = '1fr 130px 160px 160px 160px';

export default function KasDesktop(kas: KasState) {
    const {
        settings,
        summary,
        counts,
        categories,
        bars,
        recent,
        report,
        reportTotal,
        period,
        filters,
        total,
        transactions,
        rows,
        page,
        setPage,
        form,
        setForm,
        editId,
        aktifKat,
        catList,
        allCats,
        q,
        setQ,
        applyFilter,
        resetFilter,
        setPeriod,
        viewer,
        setViewer,
        fileRef,
        resetForm,
        goInput,
        startEdit,
        saveTx,
        delTx,
        addCat,
        delCat,
        saveSettings,
        pickFile,
        clearFile,
        backup,
        restore,
        pickRestore,
        restoreRef,
        flash,
        logout,
    } = kas;

    const [newIn, setNewIn] = useState('');
    const [newOut, setNewOut] = useState('');
    const [namaMes, setNamaMes] = useState(settings.nama_mes);
    const [alamat, setAlamat] = useState(settings.alamat ?? '');
    const [telp, setTelp] = useState(settings.telp ?? '');

    const title = PAGES.find((p) => p.id === page)?.label ?? 'Dashboard';

    const initials = settings.nama_user
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

    const stats = [
        {
            label: 'Saldo kas',
            value: rp(summary.saldo),
            sub: 'Per ' + settings.today,
            color: C.navy,
        },
        {
            label: 'Total pemasukan',
            value: rp(summary.masuk),
            sub: counts.masuk + ' transaksi',
            color: C.teal,
        },
        {
            label: 'Total pengeluaran',
            value: rp(summary.keluar),
            sub: counts.keluar + ' transaksi',
            color: C.red,
        },
        {
            label: 'Laba bersih',
            value: signed(summary.saldo),
            sub: summary.saldo >= 0 ? 'Surplus' : 'Defisit',
            color: summary.saldo >= 0 ? C.teal : C.red,
        },
    ];

    const nominal = digits(form.nominal);
    const previewSaldo =
        summary.saldo + (form.jenis === 'masuk' ? nominal : -nominal);

    const categoryList = (list: Cat[], jenis: Jenis) =>
        list.map((c) => (
            <div
                key={c.id}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '11px 0',
                    borderBottom: '1px solid rgba(30,39,73,.06)',
                }}
            >
                <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                        {c.nama}
                    </span>
                    <span
                        style={{
                            fontSize: 11.5,
                            color: 'rgba(30,39,73,.45)',
                        }}
                    >
                        {c.info ??
                            (jenis === 'masuk'
                                ? 'Kategori pemasukan'
                                : 'Kategori pengeluaran')}
                    </span>
                </div>
                <button
                    className="kas-danger"
                    onClick={() => delCat(c)}
                    style={rowBtn}
                >
                    Hapus
                </button>
            </div>
        ));

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'grid',
                gridTemplateColumns: '236px 1fr',
                background: C.cream,
                color: C.navy,
            }}
        >
            <aside
                style={{
                    background: C.navy,
                    color: C.cream,
                    padding: '24px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 26,
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    boxSizing: 'border-box',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '0 8px',
                    }}
                >
                    <div
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: 7,
                            background: C.amber,
                        }}
                    />
                    <span
                        style={{
                            fontWeight: 700,
                            fontSize: 14.5,
                            letterSpacing: '-.01em',
                        }}
                    >
                        Kas Mes
                    </span>
                </div>

                <nav
                    style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    {PAGES.map((item) => {
                        const on = page === item.id;

                        return (
                            <button
                                key={item.id}
                                className="kas-nav"
                                onClick={() => setPage(item.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: 10,
                                    border: 'none',
                                    borderRadius: 8,
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    fontSize: 13.5,
                                    fontWeight: 500,
                                    background: on
                                        ? 'rgba(201,226,101,.14)'
                                        : 'transparent',
                                    color: on
                                        ? C.amber
                                        : 'rgba(246,242,234,.7)',
                                }}
                            >
                                <span
                                    style={{
                                        width: 3,
                                        height: 15,
                                        borderRadius: 2,
                                        background: on
                                            ? C.amber
                                            : 'transparent',
                                    }}
                                />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div
                    style={{
                        marginTop: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            padding: 13,
                            borderRadius: 10,
                            background: 'rgba(246,242,234,.06)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 11,
                                color: 'rgba(246,242,234,.45)',
                            }}
                        >
                            Saldo saat ini
                        </span>
                        <span
                            className="kas-mono"
                            style={{
                                fontSize: 16,
                                fontWeight: 600,
                                color: C.amber,
                            }}
                        >
                            {rp(summary.saldo)}
                        </span>
                    </div>
                    <button
                        onClick={logout}
                        style={{
                            padding: 9,
                            border: '1px solid rgba(246,242,234,.16)',
                            borderRadius: 8,
                            background: 'transparent',
                            color: 'rgba(246,242,234,.7)',
                            fontSize: 12.5,
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        Keluar
                    </button>
                </div>
            </aside>

            <main
                style={{
                    padding: '30px 36px 56px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24,
                    minWidth: 0,
                }}
            >
                <header
                    style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: 20,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 5,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 11.5,
                                fontWeight: 600,
                                letterSpacing: '.09em',
                                textTransform: 'uppercase',
                                color: 'rgba(30,39,73,.42)',
                            }}
                        >
                            {settings.nama_mes}
                        </span>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: 29,
                                letterSpacing: '-.03em',
                                fontWeight: 700,
                            }}
                        >
                            {title}
                        </h1>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        <span
                            className="kas-mono"
                            style={{
                                fontSize: 12.5,
                                color: 'rgba(30,39,73,.5)',
                            }}
                        >
                            {settings.today}
                        </span>
                        <button
                            className="kas-teal"
                            onClick={() => goInput('masuk')}
                            style={{
                                ...primaryBtn,
                                padding: '10px 15px',
                                fontSize: 13,
                            }}
                        >
                            + Transaksi
                        </button>
                    </div>
                </header>

                {page === 'dashboard' && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 20,
                            animation: 'rise .3s ease both',
                        }}
                    >
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4,1fr)',
                                gap: 14,
                            }}
                        >
                            {stats.map((s) => (
                                <div
                                    key={s.label}
                                    style={{
                                        ...card,
                                        padding: '17px 18px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 9,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 11.5,
                                            fontWeight: 600,
                                            color: 'rgba(30,39,73,.5)',
                                        }}
                                    >
                                        {s.label}
                                    </span>
                                    <span
                                        className="kas-mono"
                                        style={{
                                            fontSize: 23,
                                            fontWeight: 600,
                                            letterSpacing: '-.02em',
                                            color: s.color,
                                        }}
                                    >
                                        {s.value}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 11.5,
                                            color: 'rgba(30,39,73,.45)',
                                        }}
                                    >
                                        {s.sub}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div
                            style={{
                                ...card,
                                padding: '22px 24px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 20,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: 15,
                                        fontWeight: 700,
                                        letterSpacing: '-.015em',
                                    }}
                                >
                                    Kondisi keuangan 7 bulan terakhir
                                </h2>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 16,
                                        fontSize: 11.5,
                                        color: 'rgba(30,39,73,.55)',
                                    }}
                                >
                                    {[
                                        ['Pemasukan', C.teal],
                                        ['Pengeluaran', C.rust],
                                    ].map(([label, color]) => (
                                        <span
                                            key={label}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: 9,
                                                    height: 9,
                                                    borderRadius: 3,
                                                    background: color,
                                                }}
                                            />
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7,1fr)',
                                    gap: 14,
                                    alignItems: 'end',
                                    height: 190,
                                    borderBottom: '1px solid rgba(30,39,73,.1)',
                                    paddingBottom: 2,
                                }}
                            >
                                {bars.map((b) => (
                                    <div
                                        key={b.key}
                                        style={{
                                            display: 'flex',
                                            gap: 5,
                                            alignItems: 'flex-end',
                                            height: '100%',
                                        }}
                                    >
                                        <div
                                            style={{
                                                flex: 1,
                                                borderRadius: '4px 4px 0 0',
                                                background: C.teal,
                                                height: `${b.hIn}%`,
                                            }}
                                        />
                                        <div
                                            style={{
                                                flex: 1,
                                                borderRadius: '4px 4px 0 0',
                                                background: C.rust,
                                                height: `${b.hOut}%`,
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7,1fr)',
                                    gap: 14,
                                }}
                            >
                                {bars.map((b) => (
                                    <span
                                        key={b.key}
                                        style={{
                                            textAlign: 'center',
                                            fontSize: 11.5,
                                            fontWeight: 500,
                                            color: 'rgba(30,39,73,.5)',
                                        }}
                                    >
                                        {b.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ ...card, overflow: 'hidden' }}>
                            <div
                                style={{
                                    padding: '18px 22px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderBottom:
                                        '1px solid rgba(30,39,73,.08)',
                                }}
                            >
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: 15,
                                        fontWeight: 700,
                                        letterSpacing: '-.015em',
                                    }}
                                >
                                    Transaksi terbaru
                                </h2>
                                <button
                                    onClick={() => setPage('riwayat')}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        color: C.teal,
                                        fontSize: 12.5,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        padding: 0,
                                    }}
                                >
                                    Lihat semua riwayat →
                                </button>
                            </div>
                            {recent.map((t: Tx) => {
                                const d = deco(t);

                                return (
                                    <div
                                        key={t.id}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns:
                                                '96px 1fr 150px 130px',
                                            gap: 14,
                                            alignItems: 'center',
                                            padding: '13px 22px',
                                            borderBottom:
                                                '1px solid rgba(30,39,73,.055)',
                                        }}
                                    >
                                        <span
                                            className="kas-mono"
                                            style={{
                                                fontSize: 12,
                                                color: 'rgba(30,39,73,.5)',
                                            }}
                                        >
                                            {t.tgl_full}
                                        </span>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 2,
                                                minWidth: 0,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: 13.5,
                                                    fontWeight: 600,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {t.keterangan || t.kategori}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: 11.5,
                                                    color: 'rgba(30,39,73,.45)',
                                                }}
                                            >
                                                {t.kategori}
                                            </span>
                                        </div>
                                        <span
                                            style={{
                                                justifySelf: 'start',
                                                fontSize: 11,
                                                fontWeight: 600,
                                                padding: '4px 9px',
                                                borderRadius: 20,
                                                background: d.tagBg,
                                                color: d.tagFg,
                                            }}
                                        >
                                            {d.jenisLabel}
                                        </span>
                                        <span
                                            className="kas-mono"
                                            style={{
                                                justifySelf: 'end',
                                                fontSize: 13.5,
                                                fontWeight: 600,
                                                color: d.amtColor,
                                            }}
                                        >
                                            {d.amt}
                                        </span>
                                    </div>
                                );
                            })}
                            {recent.length === 0 && (
                                <div
                                    style={{
                                        padding: 44,
                                        textAlign: 'center',
                                        fontSize: 13,
                                        color: 'rgba(30,39,73,.45)',
                                    }}
                                >
                                    Belum ada transaksi.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {page === 'kategori' && (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 16,
                            alignItems: 'start',
                            animation: 'rise .3s ease both',
                        }}
                    >
                        <div
                            style={{
                                ...card,
                                padding: '20px 22px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 16,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4,
                                }}
                            >
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: 15,
                                        fontWeight: 700,
                                        letterSpacing: '-.015em',
                                    }}
                                >
                                    Kategori pemasukan
                                </h2>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 12.5,
                                        color: 'rgba(30,39,73,.5)',
                                    }}
                                >
                                    Dipakai saat mencatat iuran dan pemasukan
                                    mes.
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    value={newIn}
                                    onChange={(e) => setNewIn(e.target.value)}
                                    placeholder="Nama kategori baru"
                                    style={{
                                        ...smallField,
                                        flex: 1,
                                        minWidth: 0,
                                    }}
                                />
                                <button
                                    className="kas-teal"
                                    onClick={() =>
                                        addCat(newIn, 'masuk', () =>
                                            setNewIn(''),
                                        )
                                    }
                                    style={{
                                        ...primaryBtn,
                                        padding: '10px 14px',
                                        fontSize: 12.5,
                                    }}
                                >
                                    Tambah
                                </button>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {categoryList(categories.masuk, 'masuk')}
                            </div>
                        </div>

                        <div
                            style={{
                                ...card,
                                padding: '20px 22px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 16,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4,
                                }}
                            >
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: 15,
                                        fontWeight: 700,
                                        letterSpacing: '-.015em',
                                    }}
                                >
                                    Kategori pengeluaran
                                </h2>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 12.5,
                                        color: 'rgba(30,39,73,.5)',
                                    }}
                                >
                                    Dipakai saat mencatat belanja dan biaya mes.
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    value={newOut}
                                    onChange={(e) => setNewOut(e.target.value)}
                                    placeholder="Nama kategori baru"
                                    style={{
                                        ...smallField,
                                        flex: 1,
                                        minWidth: 0,
                                    }}
                                />
                                <button
                                    onClick={() =>
                                        addCat(newOut, 'keluar', () =>
                                            setNewOut(''),
                                        )
                                    }
                                    style={{
                                        ...primaryBtn,
                                        padding: '10px 14px',
                                        fontSize: 12.5,
                                        background: C.rustDark,
                                        color: '#faf3ea',
                                    }}
                                >
                                    Tambah
                                </button>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {categoryList(categories.keluar, 'keluar')}
                            </div>
                        </div>
                    </div>
                )}

                {page === 'input' && (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1.35fr .65fr',
                            gap: 16,
                            alignItems: 'start',
                            animation: 'rise .3s ease both',
                        }}
                    >
                        <div
                            style={{
                                ...card,
                                padding: '24px 26px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 18,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4,
                                }}
                            >
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: 15,
                                        fontWeight: 700,
                                        letterSpacing: '-.015em',
                                    }}
                                >
                                    {editId
                                        ? 'Ubah transaksi'
                                        : 'Catat transaksi baru'}
                                </h2>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 12.5,
                                        color: 'rgba(30,39,73,.5)',
                                    }}
                                >
                                    Lengkapi kolom bertanda wajib, lalu simpan.
                                </p>
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 14,
                                }}
                            >
                                <label style={labelStyle}>
                                    Tanggal *
                                    <DateField
                                        value={form.tgl}
                                        onChange={(tgl) =>
                                            setForm((s) => ({ ...s, tgl }))
                                        }
                                        ariaLabel="Tanggal transaksi"
                                    />
                                </label>
                                <label style={labelStyle}>
                                    Jenis transaksi *
                                    <select
                                        value={form.jenis}
                                        onChange={(e) =>
                                            setForm((s) => ({
                                                ...s,
                                                jenis: e.target.value as Jenis,
                                                kategori: '',
                                            }))
                                        }
                                        style={field}
                                    >
                                        <option value="masuk">Pemasukan</option>
                                        <option value="keluar">
                                            Pengeluaran
                                        </option>
                                    </select>
                                </label>
                                <label style={labelStyle}>
                                    Kategori *
                                    <select
                                        value={aktifKat}
                                        onChange={(e) =>
                                            setForm((s) => ({
                                                ...s,
                                                kategori: e.target.value,
                                            }))
                                        }
                                        style={field}
                                    >
                                        {catList.length === 0 && (
                                            <option value="">
                                                Belum ada kategori
                                            </option>
                                        )}
                                        {catList.map((c) => (
                                            <option key={c.id} value={c.nama}>
                                                {c.nama}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label style={labelStyle}>
                                    Nominal *
                                    <input
                                        value={form.nominal}
                                        onChange={(e) =>
                                            setForm((s) => ({
                                                ...s,
                                                nominal: group(
                                                    digits(e.target.value),
                                                ),
                                            }))
                                        }
                                        placeholder="0"
                                        inputMode="numeric"
                                        className="kas-mono"
                                        style={{
                                            ...field,
                                            fontSize: 14,
                                            fontWeight: 600,
                                        }}
                                    />
                                </label>
                            </div>

                            <label style={labelStyle}>
                                Keterangan
                                <textarea
                                    value={form.ket}
                                    onChange={(e) =>
                                        setForm((s) => ({
                                            ...s,
                                            ket: e.target.value,
                                        }))
                                    }
                                    rows={3}
                                    placeholder="Contoh: Iuran Juli kamar 3"
                                    style={{ ...field, resize: 'vertical' }}
                                />
                            </label>

                            <div style={labelStyle}>
                                Lampiran bukti pembayaran
                                <label
                                    className="kas-drop"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 12,
                                        padding: 16,
                                        border: '1px dashed rgba(30,39,73,.24)',
                                        borderRadius: 10,
                                        background: C.paper,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 12.5,
                                            fontWeight: 500,
                                            color: 'rgba(30,39,73,.55)',
                                        }}
                                    >
                                        {form.fileName ||
                                            'Belum ada berkas dipilih (JPG, PNG, PDF · maks 5 MB)'}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 11.5,
                                            fontWeight: 600,
                                            color: C.teal,
                                        }}
                                    >
                                        Pilih berkas
                                    </span>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={pickFile}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                {(form.fileUrl || form.fileName) && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 14,
                                            padding: 12,
                                            border: '1px solid rgba(30,39,73,.1)',
                                            borderRadius: 11,
                                            background: C.paper,
                                        }}
                                    >
                                        {form.fileUrl ? (
                                            <img
                                                src={form.fileUrl}
                                                alt="Bukti pembayaran"
                                                style={{
                                                    width: 64,
                                                    height: 64,
                                                    objectFit: 'cover',
                                                    borderRadius: 9,
                                                    background: C.stone,
                                                }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: 64,
                                                    height: 64,
                                                    borderRadius: 9,
                                                    background: C.stone,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    color: 'rgba(30,39,73,.5)',
                                                }}
                                            >
                                                PDF
                                            </div>
                                        )}
                                        <div
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 3,
                                                minWidth: 0,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {form.fileName}
                                            </span>
                                            {form.fileUrl && (
                                                <button
                                                    onClick={() =>
                                                        setViewer({
                                                            url: form.fileUrl,
                                                            name: form.fileName,
                                                        })
                                                    }
                                                    style={{
                                                        alignSelf: 'flex-start',
                                                        border: 'none',
                                                        background:
                                                            'transparent',
                                                        padding: 0,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        color: C.teal,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Lihat ukuran penuh
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            className="kas-danger"
                                            onClick={clearFile}
                                            style={{
                                                ...rowBtn,
                                                padding: '6px 11px',
                                            }}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: 10,
                                    paddingTop: 2,
                                }}
                            >
                                <button
                                    className="kas-teal"
                                    onClick={saveTx}
                                    style={primaryBtn}
                                >
                                    {editId
                                        ? 'Perbarui transaksi'
                                        : 'Simpan transaksi'}
                                </button>
                                <button
                                    onClick={resetForm}
                                    style={{
                                        padding: '12px 18px',
                                        border: '1px solid rgba(30,39,73,.16)',
                                        borderRadius: 9,
                                        background: 'transparent',
                                        fontSize: 13.5,
                                        fontWeight: 600,
                                        color: 'rgba(30,39,73,.65)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div
                            style={{
                                background: C.navy,
                                color: C.cream,
                                borderRadius: 13,
                                padding: 22,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 16,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                    letterSpacing: '.09em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(246,242,234,.45)',
                                }}
                            >
                                Pratinjau
                            </span>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 5,
                                }}
                            >
                                <span
                                    className="kas-mono"
                                    style={{
                                        fontSize: 28,
                                        fontWeight: 600,
                                        letterSpacing: '-.02em',
                                        color:
                                            form.jenis === 'masuk'
                                                ? C.amber
                                                : C.orange,
                                    }}
                                >
                                    {(form.jenis === 'masuk' ? '+ ' : '− ') +
                                        rp(nominal)}
                                </span>
                                <span
                                    style={{
                                        fontSize: 13,
                                        color: 'rgba(246,242,234,.6)',
                                    }}
                                >
                                    {(aktifKat || '—') +
                                        ' · ' +
                                        (form.jenis === 'masuk'
                                            ? 'Pemasukan'
                                            : 'Pengeluaran')}
                                </span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 9,
                                    paddingTop: 14,
                                    borderTop:
                                        '1px solid rgba(246,242,234,.15)',
                                    fontSize: 12.5,
                                }}
                            >
                                {[
                                    ['Tanggal', form.tgl, undefined],
                                    [
                                        'Saldo setelah',
                                        rp(previewSaldo),
                                        C.amber,
                                    ],
                                ].map(([label, value, color]) => (
                                    <div
                                        key={label}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: 'rgba(246,242,234,.5)',
                                            }}
                                        >
                                            {label}
                                        </span>
                                        <span
                                            className="kas-mono"
                                            style={{ color }}
                                        >
                                            {value}
                                        </span>
                                    </div>
                                ))}
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <span
                                        style={{
                                            color: 'rgba(246,242,234,.5)',
                                        }}
                                    >
                                        Bukti
                                    </span>
                                    <span>{form.fileName || 'Tidak ada'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {page === 'riwayat' && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 14,
                            animation: 'rise .3s ease both',
                        }}
                    >
                        <div
                            style={{
                                ...card,
                                padding: '16px 18px',
                                display: 'grid',
                                gridTemplateColumns: '1.4fr .8fr 1fr .9fr .9fr',
                                gap: 10,
                                alignItems: 'end',
                            }}
                        >
                            <label style={filterLabel}>
                                Cari
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Keterangan atau kategori…"
                                    style={smallField}
                                />
                            </label>
                            <label style={filterLabel}>
                                Jenis
                                <select
                                    value={filters.jenis}
                                    onChange={(e) =>
                                        applyFilter({
                                            jenis: e.target
                                                .value as typeof filters.jenis,
                                        })
                                    }
                                    style={smallField}
                                >
                                    <option value="semua">Semua</option>
                                    <option value="masuk">Pemasukan</option>
                                    <option value="keluar">Pengeluaran</option>
                                    <option value="bulan">Bulan ini</option>
                                </select>
                            </label>
                            <label style={filterLabel}>
                                Kategori
                                <select
                                    value={filters.kategori}
                                    onChange={(e) =>
                                        applyFilter({
                                            kategori: e.target.value,
                                        })
                                    }
                                    style={smallField}
                                >
                                    <option value="semua">
                                        Semua kategori
                                    </option>
                                    {allCats.map((c) => (
                                        <option key={c.id} value={c.nama}>
                                            {c.nama}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label style={filterLabel}>
                                Dari
                                <DateField
                                    value={filters.from ?? ''}
                                    onChange={(from) => applyFilter({ from })}
                                    placeholder="Awal"
                                    ariaLabel="Tanggal awal"
                                    compact
                                    clearable
                                />
                            </label>
                            <label style={filterLabel}>
                                Sampai
                                <DateField
                                    value={filters.to ?? ''}
                                    onChange={(to) => applyFilter({ to })}
                                    placeholder="Akhir"
                                    ariaLabel="Tanggal akhir"
                                    compact
                                    clearable
                                />
                            </label>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 12,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 12.5,
                                    color: 'rgba(30,39,73,.55)',
                                }}
                            >
                                {transactions.meta.total} transaksi ditampilkan
                                dari {total} total
                            </span>
                            <button
                                onClick={resetFilter}
                                style={{
                                    ...ghostBtn,
                                    background: 'transparent',
                                }}
                            >
                                Reset filter
                            </button>
                        </div>

                        <div style={{ ...card, overflow: 'hidden' }}>
                            <div
                                style={{
                                    ...headCell,
                                    display: 'grid',
                                    gridTemplateColumns: RIWAYAT_COLS,
                                    gap: 12,
                                    padding: '12px 20px',
                                    background: '#f6f5f1',
                                    borderBottom:
                                        '1px solid rgba(30,39,73,.08)',
                                }}
                            >
                                <span>Tanggal</span>
                                <span>Keterangan</span>
                                <span>Kategori</span>
                                <span>Bukti</span>
                                <span style={{ textAlign: 'right' }}>
                                    Nominal
                                </span>
                                <span style={{ textAlign: 'right' }}>Aksi</span>
                            </div>

                            <InfiniteScroll data="transactions" preserveUrl>
                                {rows.map((t) => {
                                    const d = deco(t);

                                    return (
                                        <div
                                            key={t.id}
                                            className="kas-row"
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns:
                                                    RIWAYAT_COLS,
                                                gap: 12,
                                                alignItems: 'center',
                                                padding: '12px 20px',
                                                borderBottom:
                                                    '1px solid rgba(30,39,73,.055)',
                                            }}
                                        >
                                            <span
                                                className="kas-mono"
                                                style={{
                                                    fontSize: 12,
                                                    color: 'rgba(30,39,73,.55)',
                                                }}
                                            >
                                                {t.tgl_full}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: 13.5,
                                                    fontWeight: 600,
                                                    minWidth: 0,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {t.keterangan || t.kategori}
                                            </span>
                                            <span
                                                style={{
                                                    justifySelf: 'start',
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    padding: '4px 9px',
                                                    borderRadius: 20,
                                                    background: d.tagBg,
                                                    color: d.tagFg,
                                                }}
                                            >
                                                {t.kategori}
                                            </span>
                                            {t.bukti_url ? (
                                                <button
                                                    onClick={() =>
                                                        setViewer({
                                                            url: t.bukti_url!,
                                                            name:
                                                                t.bukti_nama ??
                                                                'Bukti',
                                                        })
                                                    }
                                                    style={{
                                                        justifySelf: 'start',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 7,
                                                        border: 'none',
                                                        background:
                                                            'transparent',
                                                        padding: 0,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <img
                                                        src={t.bukti_url}
                                                        alt="Bukti"
                                                        style={{
                                                            width: 28,
                                                            height: 28,
                                                            objectFit: 'cover',
                                                            borderRadius: 7,
                                                            border: '1px solid rgba(30,39,73,.12)',
                                                        }}
                                                    />
                                                    <span
                                                        style={{
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                            color: C.teal,
                                                        }}
                                                    >
                                                        Lihat
                                                    </span>
                                                </button>
                                            ) : (
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: 'rgba(30,39,73,.5)',
                                                    }}
                                                >
                                                    —
                                                </span>
                                            )}
                                            <span
                                                className="kas-mono"
                                                style={{
                                                    textAlign: 'right',
                                                    fontSize: 13.5,
                                                    fontWeight: 600,
                                                    color: d.amtColor,
                                                }}
                                            >
                                                {d.amt}
                                            </span>
                                            <div
                                                style={{
                                                    justifySelf: 'end',
                                                    display: 'flex',
                                                    gap: 6,
                                                }}
                                            >
                                                <button
                                                    className="kas-edit"
                                                    onClick={() => startEdit(t)}
                                                    style={rowBtn}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="kas-danger"
                                                    onClick={() => delTx(t)}
                                                    style={rowBtn}
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </InfiniteScroll>

                            {rows.length === 0 && (
                                <div
                                    style={{
                                        padding: 44,
                                        textAlign: 'center',
                                        fontSize: 13,
                                        color: 'rgba(30,39,73,.45)',
                                    }}
                                >
                                    Tidak ada transaksi yang cocok dengan
                                    filter.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {page === 'laporan' && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16,
                            animation: 'rise .3s ease both',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 14,
                                flexWrap: 'wrap',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 4,
                                    padding: 4,
                                    background: C.stone,
                                    borderRadius: 10,
                                }}
                            >
                                {(
                                    ['harian', 'bulanan', 'tahunan'] as const
                                ).map((p) => {
                                    const on = period === p;

                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setPeriod(p)}
                                            style={{
                                                padding: '8px 16px',
                                                border: 'none',
                                                borderRadius: 7,
                                                fontSize: 12.5,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                background: on
                                                    ? C.navy
                                                    : 'transparent',
                                                color: on
                                                    ? C.cream
                                                    : 'rgba(30,39,73,.6)',
                                            }}
                                        >
                                            {p[0].toUpperCase() + p.slice(1)}
                                        </button>
                                    );
                                })}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={() => window.print()}
                                    style={ghostBtn}
                                >
                                    Cetak
                                </button>
                                <button
                                    onClick={() =>
                                        flash('Ekspor PDF belum tersedia.')
                                    }
                                    style={ghostBtn}
                                >
                                    Ekspor PDF
                                </button>
                                <button
                                    className="kas-teal"
                                    onClick={() =>
                                        flash('Ekspor Excel belum tersedia.')
                                    }
                                    style={{
                                        ...ghostBtn,
                                        border: 'none',
                                        background: C.teal,
                                        color: '#f3f6ef',
                                    }}
                                >
                                    Ekspor Excel
                                </button>
                            </div>
                        </div>

                        <div
                            style={{
                                ...card,
                                padding: '26px 28px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 22,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    gap: 20,
                                    paddingBottom: 18,
                                    borderBottom: '1px solid rgba(30,39,73,.1)',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 4,
                                    }}
                                >
                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: 19,
                                            fontWeight: 700,
                                            letterSpacing: '-.02em',
                                        }}
                                    >
                                        Laporan{' '}
                                        {period[0].toUpperCase() +
                                            period.slice(1)}
                                    </h2>
                                    <span
                                        style={{
                                            fontSize: 12.5,
                                            color: 'rgba(30,39,73,.5)',
                                        }}
                                    >
                                        {settings.nama_mes} · dicetak{' '}
                                        {settings.today}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-end',
                                        gap: 2,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 11.5,
                                            color: 'rgba(30,39,73,.5)',
                                        }}
                                    >
                                        Laba bersih periode
                                    </span>
                                    <span
                                        className="kas-mono"
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 600,
                                            color:
                                                summary.saldo < 0
                                                    ? C.red
                                                    : C.teal,
                                        }}
                                    >
                                        {signed(summary.saldo)}
                                    </span>
                                </div>
                            </div>

                            <div
                                style={{
                                    ...headCell,
                                    display: 'grid',
                                    gridTemplateColumns: REPORT_COLS,
                                    gap: 12,
                                    paddingBottom: 8,
                                    borderBottom:
                                        '1px solid rgba(30,39,73,.08)',
                                }}
                            >
                                <span>Periode</span>
                                <span style={{ textAlign: 'right' }}>
                                    Transaksi
                                </span>
                                <span style={{ textAlign: 'right' }}>
                                    Pemasukan
                                </span>
                                <span style={{ textAlign: 'right' }}>
                                    Pengeluaran
                                </span>
                                <span style={{ textAlign: 'right' }}>
                                    Selisih
                                </span>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {report.map((r) => (
                                    <div
                                        key={r.label}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: REPORT_COLS,
                                            gap: 12,
                                            padding: '11px 0',
                                            borderBottom:
                                                '1px solid rgba(30,39,73,.055)',
                                            fontSize: 13.5,
                                        }}
                                    >
                                        <span style={{ fontWeight: 600 }}>
                                            {r.label}
                                        </span>
                                        <span
                                            className="kas-mono"
                                            style={{
                                                textAlign: 'right',
                                                color: 'rgba(30,39,73,.6)',
                                            }}
                                        >
                                            {r.n}
                                        </span>
                                        <span
                                            className="kas-mono"
                                            style={{
                                                textAlign: 'right',
                                                color: C.teal,
                                            }}
                                        >
                                            {rp(r.masuk)}
                                        </span>
                                        <span
                                            className="kas-mono"
                                            style={{
                                                textAlign: 'right',
                                                color: C.red,
                                            }}
                                        >
                                            {rp(r.keluar)}
                                        </span>
                                        <span
                                            className="kas-mono"
                                            style={{
                                                textAlign: 'right',
                                                fontWeight: 600,
                                                color:
                                                    r.selisih < 0
                                                        ? C.red
                                                        : C.teal,
                                            }}
                                        >
                                            {signed(r.selisih)}
                                        </span>
                                    </div>
                                ))}
                                {report.length === 0 && (
                                    <span
                                        style={{
                                            padding: '20px 0',
                                            fontSize: 13,
                                            color: 'rgba(30,39,73,.45)',
                                        }}
                                    >
                                        Belum ada data untuk periode ini.
                                    </span>
                                )}
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: REPORT_COLS,
                                    gap: 12,
                                    paddingTop: 12,
                                    fontSize: 13.5,
                                    fontWeight: 700,
                                }}
                            >
                                <span>Total</span>
                                <span
                                    className="kas-mono"
                                    style={{ textAlign: 'right' }}
                                >
                                    {reportTotal.n}
                                </span>
                                <span
                                    className="kas-mono"
                                    style={{
                                        textAlign: 'right',
                                        color: C.teal,
                                    }}
                                >
                                    {rp(reportTotal.masuk)}
                                </span>
                                <span
                                    className="kas-mono"
                                    style={{
                                        textAlign: 'right',
                                        color: C.red,
                                    }}
                                >
                                    {rp(reportTotal.keluar)}
                                </span>
                                <span
                                    className="kas-mono"
                                    style={{
                                        textAlign: 'right',
                                        color:
                                            reportTotal.selisih < 0
                                                ? C.red
                                                : C.teal,
                                    }}
                                >
                                    {signed(reportTotal.selisih)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {page === 'pengaturan' && (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 16,
                            alignItems: 'start',
                            animation: 'rise .3s ease both',
                        }}
                    >
                        <div
                            style={{
                                ...card,
                                padding: '22px 24px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 16,
                            }}
                        >
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 15,
                                    fontWeight: 700,
                                    letterSpacing: '-.015em',
                                }}
                            >
                                Informasi mes
                            </h2>
                            <label style={labelStyle}>
                                Nama mes
                                <input
                                    value={namaMes}
                                    onChange={(e) => setNamaMes(e.target.value)}
                                    style={field}
                                />
                            </label>
                            <label style={labelStyle}>
                                Alamat
                                <input
                                    value={alamat}
                                    onChange={(e) => setAlamat(e.target.value)}
                                    style={field}
                                />
                            </label>
                            <label style={labelStyle}>
                                Telepon
                                <input
                                    value={telp}
                                    onChange={(e) => setTelp(e.target.value)}
                                    style={field}
                                />
                            </label>
                            <button
                                className="kas-teal"
                                onClick={() =>
                                    saveSettings({
                                        nama_mes: namaMes,
                                        alamat,
                                        telp,
                                    })
                                }
                                style={{
                                    ...primaryBtn,
                                    alignSelf: 'flex-start',
                                    padding: '10px 16px',
                                    fontSize: 13,
                                }}
                            >
                                Simpan perubahan
                            </button>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 16,
                            }}
                        >
                            <div
                                style={{
                                    ...card,
                                    padding: '22px 24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 14,
                                }}
                            >
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: 15,
                                        fontWeight: 700,
                                        letterSpacing: '-.015em',
                                    }}
                                >
                                    Data pengguna
                                </h2>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 13,
                                        padding: 13,
                                        borderRadius: 10,
                                        background: '#f6f5f1',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: 11,
                                            background: C.teal,
                                            color: '#f3f6ef',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: 14,
                                        }}
                                    >
                                        {initials}
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: 13.5,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {settings.nama_user}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: 12,
                                                color: 'rgba(30,39,73,.5)',
                                            }}
                                        >
                                            {settings.email} · Bendahara
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <a
                                        href="/settings/security"
                                        style={{
                                            ...ghostBtn,
                                            background: 'transparent',
                                            textDecoration: 'none',
                                        }}
                                    >
                                        Ubah kata sandi
                                    </a>
                                    <a
                                        href="/settings/profile"
                                        style={{
                                            ...ghostBtn,
                                            background: 'transparent',
                                            textDecoration: 'none',
                                        }}
                                    >
                                        Profil akun
                                    </a>
                                </div>
                            </div>

                            <div
                                style={{
                                    background: C.navy,
                                    color: C.cream,
                                    borderRadius: 13,
                                    padding: '22px 24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 14,
                                }}
                            >
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: 15,
                                        fontWeight: 700,
                                        letterSpacing: '-.015em',
                                    }}
                                >
                                    Backup &amp; restore
                                </h2>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 12.5,
                                        lineHeight: 1.6,
                                        color: 'rgba(246,242,234,.6)',
                                    }}
                                >
                                    Simpan salinan berkala agar data kas mes
                                    aman.
                                </p>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        onClick={backup}
                                        style={{
                                            padding: '10px 15px',
                                            border: 'none',
                                            borderRadius: 8,
                                            background: C.amber,
                                            color: C.navy,
                                            fontSize: 12.5,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Backup sekarang
                                    </button>
                                    <button
                                        onClick={pickRestore}
                                        style={{
                                            padding: '10px 15px',
                                            border: '1px solid rgba(246,242,234,.22)',
                                            borderRadius: 8,
                                            background: 'transparent',
                                            color: C.cream,
                                            fontSize: 12.5,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Restore dari berkas
                                    </button>
                                    <input
                                        ref={restoreRef}
                                        type="file"
                                        accept="application/json,.json"
                                        onChange={restore}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {viewer && (
                <div
                    onClick={() => setViewer(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 60,
                        background: 'rgba(10,14,11,.86)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 56,
                        animation: 'rise .18s ease both',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                            maxHeight: '100%',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 16,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 13.5,
                                    fontWeight: 600,
                                    color: C.cream,
                                }}
                            >
                                {viewer.name}
                            </span>
                            <button
                                onClick={() => setViewer(null)}
                                style={{
                                    border: '1px solid rgba(246,242,234,.25)',
                                    background: 'transparent',
                                    color: C.cream,
                                    borderRadius: 20,
                                    padding: '7px 15px',
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Tutup
                            </button>
                        </div>
                        <img
                            src={viewer.url}
                            alt="Bukti pembayaran"
                            style={{
                                maxWidth: '76vw',
                                maxHeight: '78vh',
                                objectFit: 'contain',
                                borderRadius: 14,
                                background: C.navy,
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
