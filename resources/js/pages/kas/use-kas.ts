import { router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import KasController from '@/actions/App/Http/Controllers/KasController';
import type { Filters, Jenis, KasPageProps, Period, Tx } from './shared';
import { barHeights, digits, group, mutationOptions, todayIso } from './shared';

export type KasPage =
    'dashboard' | 'kategori' | 'input' | 'riwayat' | 'laporan' | 'pengaturan';

export type KasForm = {
    tgl: string;
    jenis: Jenis;
    kategori: string;
    nominal: string;
    ket: string;
    file: File | null;
    fileUrl: string;
    fileName: string;
};

/** Minimal shape of the File System Access API bits used for the backup. */
type SaveFilePicker = (options?: {
    suggestedName?: string;
    types?: { description?: string; accept: Record<string, string[]> }[];
}) => Promise<{
    createWritable: () => Promise<{
        write: (data: Blob) => Promise<void>;
        close: () => Promise<void>;
    }>;
}>;

const showSaveFilePicker =
    typeof window === 'undefined'
        ? undefined
        : (window as unknown as { showSaveFilePicker?: SaveFilePicker })
              .showSaveFilePicker;

const blankForm = (): KasForm => ({
    tgl: todayIso(),
    jenis: 'masuk',
    kategori: '',
    nominal: '',
    ket: '',
    file: null,
    fileUrl: '',
    fileName: '',
});

/**
 * All state and server round-trips for the kas screens. Both the mobile and
 * desktop layouts render from this single hook so they stay in lockstep.
 */
export function useKas() {
    const { props } = usePage<KasPageProps>();
    const { settings, categories, filters, period, transactions } = props;

    const [page, setPage] = useState<KasPage>('dashboard');
    const [form, setForm] = useState<KasForm>(blankForm);
    const [editId, setEditId] = useState<number | null>(null);
    const [q, setQ] = useState(filters.q);
    const [viewer, setViewer] = useState<{ url: string; name: string } | null>(
        null,
    );
    const [toast, setToast] = useState('');
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);

    const flash = useCallback((msg: string) => {
        if (toastTimer.current) {
            clearTimeout(toastTimer.current);
        }

        setToast(msg);
        toastTimer.current = setTimeout(() => setToast(''), 2400);
    }, []);

    const lastFlash = useRef<string | null>(null);

    useEffect(() => {
        const msg = props.flash?.success;

        if (msg && msg !== lastFlash.current) {
            lastFlash.current = msg;
            const t = setTimeout(() => flash(msg), 0);

            return () => clearTimeout(t);
        }
    }, [props.flash?.success, flash]);

    const bars = useMemo(() => barHeights(props.bars), [props.bars]);
    const rows = transactions.data;

    const allCats = useMemo(
        () => [...categories.masuk, ...categories.keluar],
        [categories],
    );
    const catList =
        form.jenis === 'masuk' ? categories.masuk : categories.keluar;
    const aktifKat = form.kategori || catList[0]?.nama || '';

    /** Push riwayat/laporan state to the server; page and form state stays put. */
    const query = useCallback(
        (next: Partial<Filters & { period: Period }>, only: string[]) => {
            router.get(
                KasController.index().url,
                {
                    q: next.q ?? filters.q,
                    jenis: next.jenis ?? filters.jenis,
                    kategori: next.kategori ?? filters.kategori,
                    from: next.from ?? filters.from ?? '',
                    to: next.to ?? filters.to ?? '',
                    period: next.period ?? period,
                },
                {
                    only,
                    reset: only.includes('transactions')
                        ? ['transactions']
                        : undefined,
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        },
        [filters, period],
    );

    const applyFilter = useCallback(
        (next: Partial<Filters>) =>
            query(next, ['transactions', 'filters', 'total']),
        [query],
    );

    const setPeriod = useCallback(
        (next: Period) => query({ period: next }, ['report', 'period']),
        [query],
    );

    const resetFilter = useCallback(() => {
        setQ('');
        applyFilter({
            q: '',
            jenis: 'semua',
            kategori: 'semua',
            from: '',
            to: '',
        });
    }, [applyFilter]);

    useEffect(() => {
        if (q === filters.q) {
            return;
        }

        const t = setTimeout(() => applyFilter({ q }), 350);

        return () => clearTimeout(t);
    }, [q, filters.q, applyFilter]);

    const resetForm = useCallback(() => {
        setEditId(null);
        setForm(blankForm());

        if (fileRef.current) {
            fileRef.current.value = '';
        }
    }, []);

    const goInput = useCallback((jenis: Jenis = 'masuk') => {
        setEditId(null);
        setForm({ ...blankForm(), jenis });
        setPage('input');
    }, []);

    const startEdit = useCallback((t: Tx) => {
        setEditId(t.id);
        setForm({
            tgl: t.tgl,
            jenis: t.jenis,
            kategori: t.kategori,
            nominal: group(t.nominal),
            ket: t.keterangan ?? '',
            file: null,
            fileUrl: t.bukti_url ?? '',
            fileName: t.bukti_nama ?? '',
        });
        setPage('input');
    }, []);

    const nominal = digits(form.nominal);

    const saveTx = useCallback(() => {
        if (!nominal) {
            flash('Nominal wajib diisi.');

            return;
        }

        const payload: Record<string, string | number | File> = {
            tgl: form.tgl,
            jenis: form.jenis,
            kategori: aktifKat,
            nominal,
            keterangan: form.ket || aktifKat,
        };

        if (form.file) {
            payload.bukti = form.file;
        }

        const action = editId
            ? KasController.updateTransaction(editId)
            : KasController.storeTransaction();

        router.post(action.url, payload, {
            ...mutationOptions,
            forceFormData: true,
            onSuccess: () => {
                resetForm();
                setPage('riwayat');
            },
        });
    }, [aktifKat, editId, flash, form, nominal, resetForm]);

    const delTx = useCallback((t: Tx) => {
        if (!confirm('Hapus transaksi ini?')) {
            return;
        }

        router.delete(
            KasController.destroyTransaction(t.id).url,
            mutationOptions,
        );
    }, []);

    const addCat = useCallback(
        (nama: string, jenis: Jenis, onDone: () => void) => {
            const trimmed = nama.trim();

            if (!trimmed) {
                return;
            }

            router.post(
                KasController.storeCategory().url,
                { nama: trimmed, jenis, info: 'Kategori baru' },
                { ...mutationOptions, onSuccess: onDone },
            );
        },
        [],
    );

    const delCat = useCallback((c: { id: number }) => {
        router.delete(KasController.destroyCategory(c.id).url, mutationOptions);
    }, []);

    const saveSettings = useCallback(
        (payload: { nama_mes: string; alamat: string; telp: string }) => {
            router.patch(
                KasController.updateSettings().url,
                payload,
                mutationOptions,
            );
        },
        [],
    );

    const pickFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;
        const url =
            f && f.type.startsWith('image/') ? URL.createObjectURL(f) : '';

        setForm((s) => ({
            ...s,
            file: f,
            fileUrl: url,
            fileName: f ? f.name : '',
        }));
    }, []);

    const clearFile = useCallback(() => {
        setForm((s) => ({ ...s, file: null, fileUrl: '', fileName: '' }));

        if (fileRef.current) {
            fileRef.current.value = '';
        }
    }, []);

    /**
     * Saves the backup wherever the user picks. Chromium exposes a real
     * "Save as" dialog; everywhere else falls back to a normal download.
     */
    const backup = useCallback(async () => {
        const url = KasController.downloadBackup().url;
        const name =
            'kas-mes-' + new Date().toISOString().slice(0, 10) + '.json';

        if (showSaveFilePicker) {
            try {
                const handle = await showSaveFilePicker({
                    suggestedName: name,
                    types: [
                        {
                            description: 'Cadangan Kas Mes',
                            accept: { 'application/json': ['.json'] },
                        },
                    ],
                });
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error('Gagal mengambil cadangan.');
                }

                const writable = await handle.createWritable();
                await writable.write(await response.blob());
                await writable.close();
                flash('Cadangan tersimpan.');

                return;
            } catch (error) {
                // The user closed the dialog — nothing to report.
                if (
                    error instanceof DOMException &&
                    error.name === 'AbortError'
                ) {
                    return;
                }

                flash('Gagal menyimpan, mengunduh sebagai berkas biasa.');
            }
        }

        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }, [flash]);

    const restoreRef = useRef<HTMLInputElement | null>(null);

    const pickRestore = useCallback(() => restoreRef.current?.click(), []);

    const restore = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const proceed = confirm(
            'Pulihkan dari cadangan ini?\n\nSemua transaksi dan kategori yang ada sekarang akan dihapus dan diganti isi berkas.',
        );

        if (!proceed) {
            e.target.value = '';

            return;
        }

        router.post(
            KasController.restore().url,
            { file },
            {
                ...mutationOptions,
                forceFormData: true,
                onFinish: () => {
                    if (restoreRef.current) {
                        restoreRef.current.value = '';
                    }
                },
            },
        );
    }, []);

    const logout = useCallback(() => router.post('/logout'), []);

    return {
        ...props,
        page,
        setPage,
        form,
        setForm,
        editId,
        nominal,
        aktifKat,
        catList,
        allCats,
        bars,
        rows,
        q,
        setQ,
        applyFilter,
        resetFilter,
        setPeriod,
        viewer,
        setViewer,
        toast,
        flash,
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
        logout,
        settings,
    };
}

export type KasState = ReturnType<typeof useKas>;
