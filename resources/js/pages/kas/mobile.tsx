import { InfiniteScroll } from '@inertiajs/react';
import { useState } from 'react';
import DateField from './date-field';
import type { Jenis, Tx } from './shared';
import { C, deco, digits, group, rp } from './shared';
import type { KasPage, KasState } from './use-kas';

const TITLES: Record<KasPage, string> = {
    dashboard: 'Beranda',
    kategori: 'Kategori',
    input: 'Catat Transaksi',
    riwayat: 'Riwayat',
    laporan: 'Laporan',
    pengaturan: 'Pengaturan',
};

export default function KasMobile(kas: KasState) {
    const {
        settings,
        categories,
        summary,
        recent,
        report,
        period,
        filters,
        total,
        transactions,
        bars,
        rows,
        page,
        setPage,
        form,
        setForm,
        editId,
        aktifKat,
        catList,
        q,
        setQ,
        applyFilter,
        setPeriod,
        viewer,
        setViewer,

        flash,
        fileRef,
        resetForm,
        goInput,
        startEdit,
        saveTx,
        delTx,
        delCat,
        pickFile,
        backup,
        restore,
        pickRestore,
        restoreRef,

        logout,
    } = kas;

    const [namaMes, setNamaMes] = useState(settings.nama_mes);
    const [alamat] = useState(settings.alamat ?? '');
    const [telp, setTelp] = useState(settings.telp ?? '');
    const [newCat, setNewCat] = useState('');
    const [showFilter, setShowFilter] = useState(false);

    const onFile = pickFile;

    const saveSettings = () =>
        kas.saveSettings({ nama_mes: namaMes, alamat, telp });

    const addCat = (jenis: Jenis) =>
        kas.addCat(newCat, jenis, () => setNewCat(''));

    const tabs: { id: KasPage; label: string }[] = [
        { id: 'dashboard', label: 'Beranda' },
        { id: 'input', label: 'Catat' },
        { id: 'riwayat', label: 'Riwayat' },
        { id: 'laporan', label: 'Laporan' },
        { id: 'pengaturan', label: 'Lainnya' },
    ];

    const initials = (settings.nama_mes || 'M')
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

    const previewColor = form.jenis === 'masuk' ? C.amber : C.orange;
    const simbol = 'Rp';

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                background:
                    'radial-gradient(120% 90% at 50% 0%,#f6f5f1 0%,#e6e4dc 100%)',
                color: C.navy,
                fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
                WebkitFontSmoothing: 'antialiased',
            }}
        >
            <div
                className="kas-app"
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 440,
                    minHeight: '100vh',
                    background: C.cream,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 0 60px rgba(30,39,73,.08)',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '24px 20px 14px',
                        background: C.navy,
                        color: C.cream,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        position: 'sticky',
                        top: 0,
                        zIndex: 20,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 10.5,
                                fontWeight: 600,
                                letterSpacing: '.1em',
                                textTransform: 'uppercase',
                                color: 'rgba(246,242,234,.45)',
                            }}
                        >
                            {settings.nama_mes}
                        </span>
                        <span
                            style={{
                                fontSize: 19,
                                fontWeight: 700,
                                letterSpacing: '-.02em',
                            }}
                        >
                            {TITLES[page]}
                        </span>
                    </div>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 12,
                            background: C.amber,
                            color: C.navy,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                            fontWeight: 700,
                        }}
                    >
                        {initials}
                    </div>
                </div>

                {/* Content */}
                <div
                    style={{
                        flex: 1,
                        padding: '16px 16px 120px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                    }}
                >
                    {page === 'dashboard' && (
                        <Beranda
                            saldo={summary.saldo}
                            masuk={summary.masuk}
                            keluar={summary.keluar}
                            bars={bars}
                            recent={recent}
                            onMasuk={() => goInput('masuk')}
                            onKeluar={() => goInput('keluar')}
                            onRiwayat={() => setPage('riwayat')}
                        />
                    )}

                    {page === 'input' && (
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
                                    background: C.navy,
                                    color: C.cream,
                                    borderRadius: 18,
                                    padding: 20,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 14,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 4,
                                        padding: 4,
                                        background: 'rgba(246,242,234,.08)',
                                        borderRadius: 11,
                                    }}
                                >
                                    {(['masuk', 'keluar'] as Jenis[]).map(
                                        (j) => (
                                            <button
                                                key={j}
                                                onClick={() =>
                                                    setForm((s) => ({
                                                        ...s,
                                                        jenis: j,
                                                        kategori: '',
                                                    }))
                                                }
                                                style={{
                                                    flex: 1,
                                                    padding: 9,
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    fontSize: 12.5,
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    background:
                                                        form.jenis === j
                                                            ? C.amber
                                                            : 'transparent',
                                                    color:
                                                        form.jenis === j
                                                            ? C.navy
                                                            : 'rgba(246,242,234,.6)',
                                                }}
                                            >
                                                {j === 'masuk'
                                                    ? 'Pemasukan'
                                                    : 'Pengeluaran'}
                                            </button>
                                        ),
                                    )}
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 6,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 11.5,
                                            color: 'rgba(246,242,234,.5)',
                                        }}
                                    >
                                        Nominal
                                    </span>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                        }}
                                    >
                                        <span
                                            className="kas-mono"
                                            style={{
                                                fontSize: 22,
                                                fontWeight: 600,
                                                color: 'rgba(246,242,234,.5)',
                                            }}
                                        >
                                            {simbol}
                                        </span>
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
                                                flex: 1,
                                                minWidth: 0,
                                                padding: 0,
                                                border: 'none',
                                                background: 'transparent',
                                                fontSize: 30,
                                                fontWeight: 600,
                                                letterSpacing: '-.02em',
                                                color: previewColor,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    background: '#fff',
                                    border: '1px solid rgba(30,39,73,.08)',
                                    borderRadius: 18,
                                    padding: '16px 18px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 14,
                                }}
                            >
                                <label
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 6,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: 'rgba(30,39,73,.65)',
                                    }}
                                >
                                    Tanggal
                                    <DateField
                                        value={form.tgl}
                                        onChange={(tgl) =>
                                            setForm((s) => ({ ...s, tgl }))
                                        }
                                        ariaLabel="Tanggal transaksi"
                                    />
                                </label>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 8,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: 'rgba(30,39,73,.65)',
                                        }}
                                    >
                                        Kategori
                                    </span>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 7,
                                        }}
                                    >
                                        {catList.map((c) => {
                                            const on = c.nama === aktifKat;

                                            return (
                                                <button
                                                    key={c.id}
                                                    onClick={() =>
                                                        setForm((s) => ({
                                                            ...s,
                                                            kategori: c.nama,
                                                        }))
                                                    }
                                                    style={{
                                                        padding: '8px 13px',
                                                        borderRadius: 20,
                                                        fontSize: 12.5,
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        border: `1px solid ${on ? C.navy : 'rgba(30,39,73,.12)'}`,
                                                        background: on
                                                            ? C.navy
                                                            : '#faf9f6',
                                                        color: on
                                                            ? C.cream
                                                            : 'rgba(30,39,73,.65)',
                                                    }}
                                                >
                                                    {c.nama}
                                                </button>
                                            );
                                        })}
                                        {catList.length === 0 && (
                                            <span
                                                style={{
                                                    fontSize: 12,
                                                    color: 'rgba(30,39,73,.45)',
                                                }}
                                            >
                                                Belum ada kategori. Tambah di
                                                Lainnya.
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <label
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 6,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: 'rgba(30,39,73,.65)',
                                    }}
                                >
                                    Keterangan
                                    <textarea
                                        value={form.ket}
                                        onChange={(e) =>
                                            setForm((s) => ({
                                                ...s,
                                                ket: e.target.value,
                                            }))
                                        }
                                        rows={2}
                                        placeholder="Contoh: Iuran Juli kamar 3"
                                        style={{
                                            ...fieldStyle,
                                            resize: 'none',
                                        }}
                                    />
                                </label>
                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 10,
                                        padding: 14,
                                        border: '1px dashed rgba(30,39,73,.22)',
                                        borderRadius: 12,
                                        background: '#faf9f6',
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
                                            'Lampirkan bukti pembayaran'}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: C.teal,
                                        }}
                                    >
                                        Ambil foto
                                    </span>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={onFile}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                {(form.fileUrl || form.fileName) && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: 10,
                                            border: '1px solid rgba(30,39,73,.1)',
                                            borderRadius: 12,
                                            background: '#faf9f6',
                                        }}
                                    >
                                        {form.fileUrl ? (
                                            <img
                                                src={form.fileUrl}
                                                alt="Bukti"
                                                style={{
                                                    width: 56,
                                                    height: 56,
                                                    objectFit: 'cover',
                                                    borderRadius: 9,
                                                    background: '#e3e1da',
                                                }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: 9,
                                                    background: '#e3e1da',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 11,
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
                                                gap: 2,
                                                minWidth: 0,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: 12.5,
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
                                                        fontSize: 11.5,
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
                                            onClick={() => {
                                                setForm((s) => ({
                                                    ...s,
                                                    file: null,
                                                    fileUrl: '',
                                                    fileName: '',
                                                }));

                                                if (fileRef.current) {
                                                    fileRef.current.value = '';
                                                }
                                            }}
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                padding: 0,
                                                fontSize: 11.5,
                                                fontWeight: 600,
                                                color: C.red,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    onClick={resetForm}
                                    style={{
                                        padding: '15px 18px',
                                        border: '1px solid rgba(30,39,73,.14)',
                                        borderRadius: 14,
                                        background: 'transparent',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: 'rgba(30,39,73,.65)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={saveTx}
                                    style={{
                                        flex: 1,
                                        padding: 15,
                                        border: 'none',
                                        borderRadius: 14,
                                        background: C.teal,
                                        color: '#f3f6ef',
                                        fontSize: 14.5,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {editId
                                        ? 'Perbarui transaksi'
                                        : 'Simpan transaksi'}
                                </button>
                            </div>
                        </div>
                    )}

                    {page === 'riwayat' && (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                                animation: 'rise .3s ease both',
                            }}
                        >
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Cari keterangan atau kategori…"
                                style={{
                                    padding: '13px 14px',
                                    border: '1px solid rgba(30,39,73,.12)',
                                    borderRadius: 13,
                                    background: '#fff',
                                    fontSize: 13.5,
                                }}
                            />
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 7,
                                    overflowX: 'auto',
                                    paddingBottom: 2,
                                }}
                            >
                                {(
                                    [
                                        ['semua', 'Semua'],
                                        ['masuk', 'Pemasukan'],
                                        ['keluar', 'Pengeluaran'],
                                        ['bulan', 'Bulan ini'],
                                    ] as const
                                ).map(([id, label]) => {
                                    const on = filters.jenis === id;

                                    return (
                                        <button
                                            key={id}
                                            onClick={() =>
                                                applyFilter({ jenis: id })
                                            }
                                            style={{
                                                flex: 'none',
                                                padding: '8px 14px',
                                                borderRadius: 20,
                                                fontSize: 12.5,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                border: `1px solid ${on ? C.navy : 'rgba(30,39,73,.12)'}`,
                                                background: on
                                                    ? C.navy
                                                    : '#fff',
                                                color: on
                                                    ? C.cream
                                                    : 'rgba(30,39,73,.6)',
                                            }}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 10,
                                    padding: '0 2px',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 11.5,
                                        color: 'rgba(30,39,73,.5)',
                                    }}
                                >
                                    {transactions.meta.total} dari {total}{' '}
                                    transaksi
                                </span>
                                <button
                                    onClick={() => setShowFilter((v) => !v)}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        color: C.teal,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        padding: 0,
                                    }}
                                >
                                    {showFilter
                                        ? 'Tutup filter tanggal'
                                        : 'Filter tanggal'}
                                </button>
                            </div>
                            {showFilter && (
                                <div
                                    style={{
                                        background: '#fff',
                                        border: '1px solid rgba(30,39,73,.08)',
                                        borderRadius: 14,
                                        padding: 14,
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 10,
                                    }}
                                >
                                    <label
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 5,
                                            fontSize: 11.5,
                                            fontWeight: 600,
                                            color: 'rgba(30,39,73,.6)',
                                        }}
                                    >
                                        Dari
                                        <DateField
                                            value={filters.from ?? ''}
                                            onChange={(from) =>
                                                applyFilter({ from })
                                            }
                                            placeholder="Awal"
                                            ariaLabel="Tanggal awal"
                                            compact
                                            clearable
                                        />
                                    </label>
                                    <label
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 5,
                                            fontSize: 11.5,
                                            fontWeight: 600,
                                            color: 'rgba(30,39,73,.6)',
                                        }}
                                    >
                                        Sampai
                                        <DateField
                                            value={filters.to ?? ''}
                                            onChange={(to) =>
                                                applyFilter({ to })
                                            }
                                            placeholder="Akhir"
                                            ariaLabel="Tanggal akhir"
                                            compact
                                            clearable
                                        />
                                    </label>
                                    <button
                                        onClick={() => {
                                            setQ('');
                                            applyFilter({
                                                q: '',
                                                jenis: 'semua',
                                                from: '',
                                                to: '',
                                            });
                                        }}
                                        style={{
                                            gridColumn: 'span 2',
                                            padding: 10,
                                            border: '1px solid rgba(30,39,73,.14)',
                                            borderRadius: 10,
                                            background: 'transparent',
                                            fontSize: 12.5,
                                            fontWeight: 600,
                                            color: 'rgba(30,39,73,.65)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Reset filter
                                    </button>
                                </div>
                            )}
                            <div
                                style={{
                                    background: '#fff',
                                    border: '1px solid rgba(30,39,73,.08)',
                                    borderRadius: 18,
                                    overflow: 'hidden',
                                }}
                            >
                                <InfiniteScroll data="transactions" preserveUrl>
                                    {rows.map((t) => {
                                        const d = deco(t);

                                        return (
                                            <div
                                                key={t.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 12,
                                                    padding: '13px 16px',
                                                    borderBottom:
                                                        '1px solid rgba(30,39,73,.055)',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 34,
                                                        height: 34,
                                                        borderRadius: 11,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        fontSize: 16,
                                                        fontWeight: 700,
                                                        background: d.tagBg,
                                                        color: d.tagFg,
                                                    }}
                                                >
                                                    {d.sign}
                                                </div>
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 4,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: 13.5,
                                                            fontWeight: 600,
                                                            overflow: 'hidden',
                                                            textOverflow:
                                                                'ellipsis',
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        {t.keterangan ||
                                                            t.kategori}
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: 11,
                                                            color: 'rgba(30,39,73,.45)',
                                                        }}
                                                    >
                                                        {t.kategori} ·{' '}
                                                        {t.tgl_label}
                                                    </span>
                                                    {t.bukti_url && (
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
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                gap: 6,
                                                                border: 'none',
                                                                background:
                                                                    'transparent',
                                                                padding: 0,
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            <img
                                                                src={
                                                                    t.bukti_url
                                                                }
                                                                alt="Bukti"
                                                                style={{
                                                                    width: 26,
                                                                    height: 26,
                                                                    objectFit:
                                                                        'cover',
                                                                    borderRadius: 7,
                                                                    background:
                                                                        '#e3e1da',
                                                                    border: '1px solid rgba(30,39,73,.1)',
                                                                }}
                                                            />
                                                            <span
                                                                style={{
                                                                    fontSize: 11,
                                                                    fontWeight: 600,
                                                                    color: C.teal,
                                                                }}
                                                            >
                                                                Lihat bukti
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'flex-end',
                                                        gap: 5,
                                                    }}
                                                >
                                                    <span
                                                        className="kas-mono"
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            color: d.amtColor,
                                                        }}
                                                    >
                                                        {d.amt}
                                                    </span>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            gap: 10,
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                startEdit(t)
                                                            }
                                                            style={{
                                                                border: 'none',
                                                                background:
                                                                    'transparent',
                                                                padding: 0,
                                                                fontSize: 11.5,
                                                                fontWeight: 600,
                                                                color: 'rgba(30,39,73,.5)',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                delTx(t)
                                                            }
                                                            style={{
                                                                border: 'none',
                                                                background:
                                                                    'transparent',
                                                                padding: 0,
                                                                fontSize: 11.5,
                                                                fontWeight: 600,
                                                                color: C.red,
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </InfiniteScroll>
                                {rows.length === 0 && (
                                    <div
                                        style={{
                                            padding: '38px 20px',
                                            textAlign: 'center',
                                            fontSize: 13,
                                            color: 'rgba(30,39,73,.45)',
                                        }}
                                    >
                                        Tidak ada transaksi yang cocok.
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
                                gap: 14,
                                animation: 'rise .3s ease both',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 4,
                                    padding: 4,
                                    background: '#e3e1da',
                                    borderRadius: 12,
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
                                                flex: 1,
                                                padding: 10,
                                                border: 'none',
                                                borderRadius: 9,
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
                            <div
                                style={{
                                    background: '#fff',
                                    border: '1px solid rgba(30,39,73,.08)',
                                    borderRadius: 18,
                                    padding: 18,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 14,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        gap: 12,
                                        paddingBottom: 14,
                                        borderBottom:
                                            '1px solid rgba(30,39,73,.09)',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 3,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: 14.5,
                                                fontWeight: 700,
                                                letterSpacing: '-.015em',
                                            }}
                                        >
                                            Laporan{' '}
                                            {period[0].toUpperCase() +
                                                period.slice(1)}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: 11.5,
                                                color: 'rgba(30,39,73,.5)',
                                            }}
                                        >
                                            {settings.nama_mes} ·{' '}
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
                                                fontSize: 10.5,
                                                color: 'rgba(30,39,73,.5)',
                                            }}
                                        >
                                            Laba bersih
                                        </span>
                                        <span
                                            className="kas-mono"
                                            style={{
                                                fontSize: 15,
                                                fontWeight: 600,
                                                color:
                                                    summary.saldo < 0
                                                        ? C.red
                                                        : C.teal,
                                            }}
                                        >
                                            {(summary.saldo < 0 ? '−' : '') +
                                                rp(summary.saldo)}
                                        </span>
                                    </div>
                                </div>
                                {report.map((r) => (
                                    <div
                                        key={r.label}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 7,
                                            paddingBottom: 11,
                                            borderBottom:
                                                '1px solid rgba(30,39,73,.055)',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'baseline',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: 13.5,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {r.label}
                                            </span>
                                            <span
                                                className="kas-mono"
                                                style={{
                                                    fontSize: 13.5,
                                                    fontWeight: 600,
                                                    color:
                                                        r.selisih < 0
                                                            ? C.red
                                                            : C.teal,
                                                }}
                                            >
                                                {(r.selisih < 0 ? '−' : '') +
                                                    rp(r.selisih)}
                                            </span>
                                        </div>
                                        <div
                                            className="kas-mono"
                                            style={{
                                                display: 'flex',
                                                gap: 14,
                                                fontSize: 11.5,
                                            }}
                                        >
                                            <span style={{ color: C.teal }}>
                                                ↑ {rp(r.masuk)}
                                            </span>
                                            <span style={{ color: C.red }}>
                                                ↓ {rp(r.keluar)}
                                            </span>
                                            <span
                                                style={{
                                                    color: 'rgba(30,39,73,.45)',
                                                }}
                                            >
                                                {r.n} trx
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {report.length === 0 && (
                                    <span
                                        style={{
                                            fontSize: 13,
                                            color: 'rgba(30,39,73,.45)',
                                        }}
                                    >
                                        Belum ada data untuk periode ini.
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={() =>
                                        flash('Laporan diekspor ke PDF.')
                                    }
                                    style={{
                                        flex: 1,
                                        padding: 13,
                                        border: '1px solid rgba(30,39,73,.14)',
                                        borderRadius: 13,
                                        background: '#fff',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: C.navy,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Ekspor PDF
                                </button>
                                <button
                                    onClick={() =>
                                        flash('Laporan diekspor ke Excel.')
                                    }
                                    style={{
                                        flex: 1,
                                        padding: 13,
                                        border: 'none',
                                        borderRadius: 13,
                                        background: C.teal,
                                        color: '#f3f6ef',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Ekspor Excel
                                </button>
                            </div>
                        </div>
                    )}

                    {page === 'pengaturan' && (
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
                                    background: '#fff',
                                    border: '1px solid rgba(30,39,73,.08)',
                                    borderRadius: 18,
                                    padding: '16px 18px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 700,
                                        letterSpacing: '-.015em',
                                    }}
                                >
                                    Informasi mes
                                </span>
                                <label
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 6,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: 'rgba(30,39,73,.65)',
                                    }}
                                >
                                    Nama mes
                                    <input
                                        value={namaMes}
                                        onChange={(e) =>
                                            setNamaMes(e.target.value)
                                        }
                                        onBlur={saveSettings}
                                        style={fieldStyle}
                                    />
                                </label>
                                <label
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 6,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: 'rgba(30,39,73,.65)',
                                    }}
                                >
                                    Telepon
                                    <input
                                        value={telp}
                                        onChange={(e) =>
                                            setTelp(e.target.value)
                                        }
                                        onBlur={saveSettings}
                                        style={fieldStyle}
                                    />
                                </label>
                            </div>

                            <div
                                style={{
                                    background: '#fff',
                                    border: '1px solid rgba(30,39,73,.08)',
                                    borderRadius: 18,
                                    padding: '16px 18px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 700,
                                            letterSpacing: '-.015em',
                                        }}
                                    >
                                        Kategori
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 11.5,
                                            color: 'rgba(30,39,73,.45)',
                                        }}
                                    >
                                        {categories.masuk.length +
                                            categories.keluar.length}{' '}
                                        kategori
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input
                                        value={newCat}
                                        onChange={(e) =>
                                            setNewCat(e.target.value)
                                        }
                                        placeholder="Kategori baru"
                                        style={{
                                            ...fieldStyle,
                                            flex: 1,
                                            minWidth: 0,
                                            padding: '11px 12px',
                                            fontSize: 13,
                                        }}
                                    />
                                    <button
                                        onClick={() => addCat('masuk')}
                                        style={{
                                            padding: '11px 12px',
                                            border: 'none',
                                            borderRadius: 11,
                                            background: 'rgba(47,122,104,.1)',
                                            color: C.teal,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        + Masuk
                                    </button>
                                    <button
                                        onClick={() => addCat('keluar')}
                                        style={{
                                            padding: '11px 12px',
                                            border: 'none',
                                            borderRadius: 11,
                                            background: 'rgba(200,121,79,.16)',
                                            color: '#9c4726',
                                            fontSize: 12,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        + Keluar
                                    </button>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 7,
                                    }}
                                >
                                    {categories.masuk.map((c) => (
                                        <CatChip
                                            key={`m${c.id}`}
                                            nama={c.nama}
                                            bg="rgba(47,122,104,.09)"
                                            fg={C.teal}
                                            onDel={() => delCat(c)}
                                        />
                                    ))}
                                    {categories.keluar.map((c) => (
                                        <CatChip
                                            key={`k${c.id}`}
                                            nama={c.nama}
                                            bg="rgba(200,121,79,.14)"
                                            fg="#9c4726"
                                            onDel={() => delCat(c)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div
                                style={{
                                    background: C.navy,
                                    color: C.cream,
                                    borderRadius: 18,
                                    padding: 18,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 700,
                                        letterSpacing: '-.015em',
                                    }}
                                >
                                    Backup &amp; restore
                                </span>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 12,
                                        lineHeight: 1.6,
                                        color: 'rgba(246,242,234,.6)',
                                    }}
                                >
                                    Simpan cadangan data kas mes secara berkala.
                                </p>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        onClick={backup}
                                        style={{
                                            flex: 1,
                                            padding: 12,
                                            border: 'none',
                                            borderRadius: 11,
                                            background: C.amber,
                                            color: C.navy,
                                            fontSize: 12.5,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Backup
                                    </button>
                                    <button
                                        onClick={pickRestore}
                                        style={{
                                            flex: 1,
                                            padding: 12,
                                            border: '1px solid rgba(246,242,234,.2)',
                                            borderRadius: 11,
                                            background: 'transparent',
                                            color: C.cream,
                                            fontSize: 12.5,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Restore
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

                            <button
                                onClick={logout}
                                style={{
                                    padding: 14,
                                    border: '1px solid rgba(30,39,73,.14)',
                                    borderRadius: 13,
                                    background: 'transparent',
                                    fontSize: 13.5,
                                    fontWeight: 600,
                                    color: C.red,
                                    cursor: 'pointer',
                                }}
                            >
                                Keluar dari akun
                            </button>
                        </div>
                    )}
                </div>

                {/* Bottom nav */}
                <div
                    style={{
                        position: 'sticky',
                        bottom: 0,
                        zIndex: 30,
                        padding: '8px 12px 20px',
                        background:
                            'linear-gradient(to top,#f6f2ea 62%,rgba(246,242,234,0))',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            background: '#fff',
                            border: '1px solid rgba(30,39,73,.08)',
                            borderRadius: 22,
                            padding: '7px 8px',
                            boxShadow: '0 6px 20px rgba(30,39,73,.09)',
                        }}
                    >
                        {tabs.map((t) => {
                            const on = page === t.id;

                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setPage(t.id)}
                                    style={{
                                        flex: 1,
                                        padding: '8px 2px',
                                        border: 'none',
                                        borderRadius: 15,
                                        background: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 5,
                                        cursor: 'pointer',
                                        fontSize: 10.5,
                                        fontWeight: 600,
                                        color: on
                                            ? C.navy
                                            : 'rgba(30,39,73,.42)',
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 20,
                                            height: 4,
                                            borderRadius: 3,
                                            background: on
                                                ? C.teal
                                                : 'rgba(30,39,73,.14)',
                                        }}
                                    />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Viewer */}
                {viewer && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 60,
                            background: 'rgba(10,14,11,.92)',
                            display: 'flex',
                            flexDirection: 'column',
                            animation: 'rise .2s ease both',
                        }}
                    >
                        <div
                            style={{
                                padding: '24px 18px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 12,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: C.cream,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
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
                                    padding: '7px 14px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Tutup
                            </button>
                        </div>
                        <div
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '16px 18px 46px',
                            }}
                        >
                            <img
                                src={viewer.url}
                                alt="Bukti"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    borderRadius: 14,
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const fieldStyle: React.CSSProperties = {
    padding: 12,
    border: '1px solid rgba(30,39,73,.14)',
    borderRadius: 11,
    background: '#faf9f6',
    fontSize: 14,
    color: '#1e2749',
};

function CatChip({
    nama,
    bg,
    fg,
    onDel,
}: {
    nama: string;
    bg: string;
    fg: string;
    onDel: () => void;
}) {
    return (
        <button
            onClick={onDel}
            style={{
                padding: '8px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid rgba(30,39,73,.1)',
                background: bg,
                color: fg,
            }}
        >
            {nama} ×
        </button>
    );
}

function Beranda({
    saldo,
    masuk,
    keluar,
    bars,
    recent,
    onMasuk,
    onKeluar,
    onRiwayat,
}: {
    saldo: number;
    masuk: number;
    keluar: number;
    bars: { label: string; hIn: number; hOut: number }[];
    recent: Tx[];
    onMasuk: () => void;
    onKeluar: () => void;
    onRiwayat: () => void;
}) {
    return (
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
                    background: C.navy,
                    color: C.cream,
                    borderRadius: 18,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                }}
            >
                <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 5 }}
                >
                    <span
                        style={{
                            fontSize: 11.5,
                            color: 'rgba(246,242,234,.5)',
                        }}
                    >
                        Saldo kas saat ini
                    </span>
                    <span
                        className="kas-mono"
                        style={{
                            fontSize: 31,
                            fontWeight: 600,
                            letterSpacing: '-.02em',
                            color: C.amber,
                        }}
                    >
                        {rp(saldo)}
                    </span>
                </div>
                <div
                    style={{
                        display: 'flex',
                        gap: 10,
                        paddingTop: 14,
                        borderTop: '1px solid rgba(246,242,234,.14)',
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 11,
                                color: 'rgba(246,242,234,.5)',
                            }}
                        >
                            Pemasukan
                        </span>
                        <span
                            className="kas-mono"
                            style={{ fontSize: 14.5, fontWeight: 600 }}
                        >
                            {rp(masuk)}
                        </span>
                    </div>
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 11,
                                color: 'rgba(246,242,234,.5)',
                            }}
                        >
                            Pengeluaran
                        </span>
                        <span
                            className="kas-mono"
                            style={{
                                fontSize: 14.5,
                                fontWeight: 600,
                                color: C.orange,
                            }}
                        >
                            {rp(keluar)}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
                <button
                    onClick={onMasuk}
                    style={{
                        flex: 1,
                        padding: '14px 12px',
                        border: '1px solid rgba(30,39,73,.1)',
                        borderRadius: 14,
                        background: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                    }}
                >
                    <span
                        style={{
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: C.teal,
                        }}
                    >
                        + Pemasukan
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(30,39,73,.5)' }}>
                        Catat uang masuk
                    </span>
                </button>
                <button
                    onClick={onKeluar}
                    style={{
                        flex: 1,
                        padding: '14px 12px',
                        border: '1px solid rgba(30,39,73,.1)',
                        borderRadius: 14,
                        background: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                    }}
                >
                    <span
                        style={{
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: C.red,
                        }}
                    >
                        − Pengeluaran
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(30,39,73,.5)' }}>
                        Catat uang keluar
                    </span>
                </button>
            </div>

            <div
                style={{
                    background: '#fff',
                    border: '1px solid rgba(30,39,73,.08)',
                    borderRadius: 18,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                    }}
                >
                    <span
                        style={{
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: '-.015em',
                        }}
                    >
                        Kondisi keuangan
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(30,39,73,.5)' }}>
                        7 bulan terakhir
                    </span>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7,1fr)',
                        gap: 8,
                        alignItems: 'end',
                        height: 120,
                        borderBottom: '1px solid rgba(30,39,73,.1)',
                    }}
                >
                    {bars.map((b) => (
                        <div
                            key={b.label}
                            style={{
                                display: 'flex',
                                gap: 3,
                                alignItems: 'flex-end',
                                height: '100%',
                            }}
                        >
                            <div
                                style={{
                                    flex: 1,
                                    borderRadius: '3px 3px 0 0',
                                    background: C.teal,
                                    height: `${b.hIn}%`,
                                }}
                            />
                            <div
                                style={{
                                    flex: 1,
                                    borderRadius: '3px 3px 0 0',
                                    background: '#d1673f',
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
                        gap: 8,
                    }}
                >
                    {bars.map((b) => (
                        <span
                            key={b.label}
                            style={{
                                textAlign: 'center',
                                fontSize: 10.5,
                                fontWeight: 500,
                                color: 'rgba(30,39,73,.5)',
                            }}
                        >
                            {b.label}
                        </span>
                    ))}
                </div>
            </div>

            <div
                style={{
                    background: '#fff',
                    border: '1px solid rgba(30,39,73,.08)',
                    borderRadius: 18,
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        padding: '15px 18px 11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <span
                        style={{
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: '-.015em',
                        }}
                    >
                        Transaksi terbaru
                    </span>
                    <button
                        onClick={onRiwayat}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            color: C.teal,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0,
                        }}
                    >
                        Semua
                    </button>
                </div>
                {recent.map((t) => {
                    const d = deco(t);

                    return (
                        <div
                            key={t.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 18px',
                                borderTop: '1px solid rgba(30,39,73,.055)',
                            }}
                        >
                            <div
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 11,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 16,
                                    fontWeight: 700,
                                    background: d.tagBg,
                                    color: d.tagFg,
                                }}
                            >
                                {d.sign}
                            </div>
                            <div
                                style={{
                                    flex: 1,
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
                                        fontSize: 11,
                                        color: 'rgba(30,39,73,.45)',
                                    }}
                                >
                                    {t.kategori} · {t.tgl_label}
                                </span>
                            </div>
                            <span
                                className="kas-mono"
                                style={{
                                    fontSize: 13,
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
                            padding: '28px 20px',
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
    );
}
