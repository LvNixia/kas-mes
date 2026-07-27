<?php

namespace App\Http\Controllers;

use App\Http\Resources\TransactionResource;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Database\Query\Builder;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class KasController extends Controller
{
    /**
     * Indonesian short month labels, indexed by month number - 1.
     *
     * @var list<string>
     */
    private const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    private const PERIODS = ['harian', 'bulanan', 'tahunan'];

    private const JENIS_FILTERS = ['semua', 'masuk', 'keluar', 'bulan'];

    private const BAR_MONTHS = 7;

    private const PER_PAGE = 20;

    /** Marker written into backup files so foreign JSON is rejected on restore. */
    private const BACKUP_APP = 'kas-mes';

    private const BACKUP_VERSION = 1;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $filters = $this->filters($request);
        $period = $request->string('period')->toString();
        $period = in_array($period, self::PERIODS, true) ? $period : 'bulanan';

        $categories = $user->categories()->orderBy('id')->get();
        $summary = $this->summary($user);

        return Inertia::render('kas/index', [
            'settings' => [
                'nama_mes' => $user->nama_mes ?? 'Mes Griya Asri',
                'alamat' => $user->alamat,
                'telp' => $user->telp,
                'nama_user' => $user->name,
                'email' => $user->email,
                'today' => $this->dayLabel(now()),
            ],
            'categories' => [
                'masuk' => $this->presentCategories($categories->where('jenis', 'masuk')),
                'keluar' => $this->presentCategories($categories->where('jenis', 'keluar')),
            ],
            'summary' => $summary,
            'counts' => [
                'masuk' => $user->transactions()->where('jenis', 'masuk')->count(),
                'keluar' => $user->transactions()->where('jenis', 'keluar')->count(),
            ],
            'bars' => $this->bars($user),
            'recent' => TransactionResource::collection(
                $user->transactions()
                    ->orderByDesc('tgl')
                    ->orderByDesc('id')
                    ->limit(4)
                    ->get()
            )->resolve(),
            'period' => $period,
            'report' => $this->report($user, $period),
            'reportTotal' => [
                'n' => $user->transactions()->count(),
                'masuk' => $summary['masuk'],
                'keluar' => $summary['keluar'],
                'selisih' => $summary['saldo'],
            ],
            'filters' => $filters,
            'total' => $user->transactions()->count(),
            'transactions' => Inertia::scroll(
                fn () => $this->paginatedTransactions($user, $filters)
            ),
        ]);
    }

    public function storeTransaction(Request $request): RedirectResponse
    {
        $data = $this->validateTransaction($request);
        $data['user_id'] = $request->user()->id;
        $data['bukti_path'] = $this->storeBukti($request);

        Transaction::create($data);

        return back()->with('success', 'Transaksi tersimpan.');
    }

    public function updateTransaction(Request $request, Transaction $transaction): RedirectResponse
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);

        $data = $this->validateTransaction($request);

        if ($request->hasFile('bukti')) {
            if ($transaction->bukti_path) {
                Storage::disk('public')->delete($transaction->bukti_path);
            }
            $data['bukti_path'] = $this->storeBukti($request);
        }

        $transaction->update($data);

        return back()->with('success', 'Transaksi diperbarui.');
    }

    public function destroyTransaction(Request $request, Transaction $transaction): RedirectResponse
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);

        if ($transaction->bukti_path) {
            Storage::disk('public')->delete($transaction->bukti_path);
        }

        $transaction->delete();

        return back()->with('success', 'Transaksi dihapus.');
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:60'],
            'jenis' => ['required', Rule::in(['masuk', 'keluar'])],
            'info' => ['nullable', 'string', 'max:120'],
        ]);

        $request->user()->categories()->firstOrCreate(
            ['nama' => $data['nama'], 'jenis' => $data['jenis']],
            ['info' => $data['info'] ?? null],
        );

        return back()->with('success', 'Kategori ditambahkan.');
    }

    public function destroyCategory(Request $request, Category $category): RedirectResponse
    {
        abort_unless($category->user_id === $request->user()->id, 403);

        $category->delete();

        return back()->with('success', 'Kategori dihapus.');
    }

    /**
     * Streams the signed in user's data as a JSON file the browser can save anywhere.
     *
     * Uploaded proof files are not embedded; only their names are recorded.
     */
    public function downloadBackup(Request $request): StreamedResponse
    {
        $user = $request->user();

        $payload = [
            'app' => self::BACKUP_APP,
            'version' => self::BACKUP_VERSION,
            'exported_at' => now()->toIso8601String(),
            'settings' => [
                'nama_mes' => $user->nama_mes,
                'alamat' => $user->alamat,
                'telp' => $user->telp,
            ],
            'categories' => $user->categories()
                ->orderBy('id')
                ->get()
                ->map(fn (Category $c): array => [
                    'nama' => $c->nama,
                    'jenis' => $c->jenis,
                    'info' => $c->info,
                ])
                ->all(),
            'transactions' => $user->transactions()
                ->orderBy('tgl')
                ->orderBy('id')
                ->get()
                ->map(fn (Transaction $t): array => [
                    'tgl' => $t->tgl->format('Y-m-d'),
                    'jenis' => $t->jenis,
                    'kategori' => $t->kategori,
                    'nominal' => $t->nominal,
                    'keterangan' => $t->keterangan,
                    'bukti_nama' => $t->bukti_path ? basename($t->bukti_path) : null,
                ])
                ->all(),
        ];

        $filename = 'kas-mes-'.now()->format('Y-m-d-His').'.json';

        return response()->streamDownload(
            function () use ($payload): void {
                echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            },
            $filename,
            ['Content-Type' => 'application/json'],
        );
    }

    /**
     * Replaces the signed in user's categories and transactions with a backup file.
     */
    public function restore(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:5120'],
        ]);

        $contents = file_get_contents($request->file('file')->getRealPath());
        $data = json_decode((string) $contents, true);

        if (! is_array($data) || ($data['app'] ?? null) !== self::BACKUP_APP) {
            throw ValidationException::withMessages([
                'file' => 'Berkas ini bukan cadangan Kas Mes.',
            ]);
        }

        $validated = Validator::make($data, [
            'settings' => ['nullable', 'array'],
            'settings.nama_mes' => ['nullable', 'string', 'max:120'],
            'settings.alamat' => ['nullable', 'string', 'max:180'],
            'settings.telp' => ['nullable', 'string', 'max:40'],
            'categories' => ['nullable', 'array', 'max:500'],
            'categories.*.nama' => ['required', 'string', 'max:60'],
            'categories.*.jenis' => ['required', Rule::in(['masuk', 'keluar'])],
            'categories.*.info' => ['nullable', 'string', 'max:120'],
            'transactions' => ['nullable', 'array', 'max:20000'],
            'transactions.*.tgl' => ['required', 'date'],
            'transactions.*.jenis' => ['required', Rule::in(['masuk', 'keluar'])],
            'transactions.*.kategori' => ['required', 'string', 'max:60'],
            'transactions.*.nominal' => ['required', 'integer', 'min:1'],
            'transactions.*.keterangan' => ['nullable', 'string', 'max:255'],
        ], [], ['file' => 'berkas cadangan'])->validate();

        $user = $request->user();

        DB::transaction(function () use ($user, $validated): void {
            foreach ($user->transactions()->whereNotNull('bukti_path')->pluck('bukti_path') as $path) {
                Storage::disk('public')->delete($path);
            }

            $user->transactions()->delete();
            $user->categories()->delete();

            if (isset($validated['settings'])) {
                $user->update([
                    'nama_mes' => $validated['settings']['nama_mes'] ?? $user->nama_mes,
                    'alamat' => $validated['settings']['alamat'] ?? null,
                    'telp' => $validated['settings']['telp'] ?? null,
                ]);
            }

            foreach ($validated['categories'] ?? [] as $category) {
                $user->categories()->firstOrCreate(
                    ['nama' => $category['nama'], 'jenis' => $category['jenis']],
                    ['info' => $category['info'] ?? null],
                );
            }

            foreach ($validated['transactions'] ?? [] as $transaction) {
                $user->transactions()->create([
                    'tgl' => $transaction['tgl'],
                    'jenis' => $transaction['jenis'],
                    'kategori' => $transaction['kategori'],
                    'nominal' => $transaction['nominal'],
                    'keterangan' => $transaction['keterangan'] ?? null,
                ]);
            }
        });

        $jumlah = count($validated['transactions'] ?? []);

        return back()->with('success', 'Cadangan dipulihkan — '.$jumlah.' transaksi.');
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nama_mes' => ['required', 'string', 'max:120'],
            'alamat' => ['nullable', 'string', 'max:180'],
            'telp' => ['nullable', 'string', 'max:40'],
        ]);

        $request->user()->update($data);

        return back()->with('success', 'Pengaturan disimpan.');
    }

    /**
     * Total pemasukan, pengeluaran and resulting balance, aggregated by the database.
     *
     * @return array{masuk: int, keluar: int, saldo: int}
     */
    private function summary(User $user): array
    {
        $row = (array) $user->transactions()
            ->selectRaw($this->sumCase('masuk').' as masuk')
            ->selectRaw($this->sumCase('keluar').' as keluar')
            ->toBase()
            ->first();

        $masuk = (int) ($row['masuk'] ?? 0);
        $keluar = (int) ($row['keluar'] ?? 0);

        return ['masuk' => $masuk, 'keluar' => $keluar, 'saldo' => $masuk - $keluar];
    }

    /**
     * Income/expense totals for the last months, relative to today and keyed by real year-month.
     *
     * @return list<array{key: string, label: string, masuk: int, keluar: int}>
     */
    private function bars(User $user): array
    {
        $start = now()->startOfMonth()->subMonths(self::BAR_MONTHS - 1);

        $totals = [];

        $aggregated = $user->transactions()
            ->where('tgl', '>=', $start->toDateString())
            ->selectRaw($this->yearMonth().' as ym')
            ->selectRaw($this->sumCase('masuk').' as masuk')
            ->selectRaw($this->sumCase('keluar').' as keluar')
            ->groupByRaw($this->yearMonth())
            ->toBase()
            ->get();

        foreach ($aggregated as $raw) {
            $row = (array) $raw;
            $totals[(string) $row['ym']] = $row;
        }

        $bars = [];

        for ($offset = 0; $offset < self::BAR_MONTHS; $offset++) {
            $month = $start->addMonths($offset);
            $key = $month->format('Y-m');

            $bars[] = [
                'key' => $key,
                'label' => self::MONTHS[$month->month - 1],
                'masuk' => (int) ($totals[$key]['masuk'] ?? 0),
                'keluar' => (int) ($totals[$key]['keluar'] ?? 0),
            ];
        }

        return $bars;
    }

    /**
     * Aggregated report rows for the given period, newest bucket first.
     *
     * @return list<array{label: string, masuk: int, keluar: int, selisih: int, n: int}>
     */
    private function report(User $user, string $period): array
    {
        $bucket = match ($period) {
            'harian' => $this->dateOnly(),
            'tahunan' => $this->year(),
            default => $this->yearMonth(),
        };

        $limit = match ($period) {
            'harian' => 14,
            'tahunan' => 10,
            default => 12,
        };

        $aggregated = $user->transactions()
            ->selectRaw($bucket.' as bucket')
            ->selectRaw($this->sumCase('masuk').' as masuk')
            ->selectRaw($this->sumCase('keluar').' as keluar')
            ->selectRaw('COUNT(*) as n')
            ->groupByRaw($bucket)
            ->orderByRaw($bucket.' desc')
            ->limit($limit)
            ->toBase()
            ->get();

        $rows = [];

        foreach ($aggregated as $raw) {
            $row = (array) $raw;
            $masuk = (int) $row['masuk'];
            $keluar = (int) $row['keluar'];

            $rows[] = [
                'label' => $this->bucketLabel((string) $row['bucket'], $period),
                'masuk' => $masuk,
                'keluar' => $keluar,
                'selisih' => $masuk - $keluar,
                'n' => (int) $row['n'],
            ];
        }

        return $rows;
    }

    /**
     * @return array{q: string, jenis: string, kategori: string, from: string|null, to: string|null}
     */
    private function filters(Request $request): array
    {
        $jenis = $request->string('jenis')->toString();
        $kategori = $request->string('kategori')->trim()->toString();

        return [
            'q' => $request->string('q')->trim()->toString(),
            'jenis' => in_array($jenis, self::JENIS_FILTERS, true) ? $jenis : 'semua',
            'kategori' => $kategori === '' ? 'semua' : $kategori,
            'from' => $this->dateOrNull($request->string('from')->toString()),
            'to' => $this->dateOrNull($request->string('to')->toString()),
        ];
    }

    /**
     * Accept a Y-m-d string from the query string, ignoring anything malformed.
     */
    private function dateOrNull(string $value): ?string
    {
        try {
            return $value === ''
                ? null
                : Carbon::createFromFormat('Y-m-d', $value)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * One page of filtered transactions, already shaped for the frontend.
     *
     * @param  array{q: string, jenis: string, kategori: string, from: string|null, to: string|null}  $filters
     */
    private function paginatedTransactions(User $user, array $filters): AnonymousResourceCollection
    {
        return TransactionResource::collection(
            $this->filteredQuery($user, $filters)->paginate(self::PER_PAGE)
        );
    }

    /**
     * @param  array{q: string, jenis: string, kategori: string, from: string|null, to: string|null}  $filters
     * @return EloquentBuilder<Transaction>
     */
    private function filteredQuery(User $user, array $filters): EloquentBuilder
    {
        return $user->transactions()->getQuery()
            ->when($filters['q'] !== '', function (Builder $query) use ($filters): void {
                $term = '%'.str_replace(['%', '_'], ['\%', '\_'], $filters['q']).'%';
                $query->where(function (Builder $inner) use ($term): void {
                    $inner->where('keterangan', 'like', $term)->orWhere('kategori', 'like', $term);
                });
            })
            ->when(
                in_array($filters['jenis'], ['masuk', 'keluar'], true),
                fn (Builder $query) => $query->where('jenis', $filters['jenis'])
            )
            ->when(
                $filters['kategori'] !== 'semua',
                fn (Builder $query) => $query->where('kategori', $filters['kategori'])
            )
            ->when($filters['jenis'] === 'bulan', fn (Builder $query) => $query->whereBetween('tgl', [
                now()->startOfMonth()->toDateString(),
                now()->endOfMonth()->toDateString(),
            ]))
            ->when($filters['from'], fn (Builder $query, string $from) => $query->where('tgl', '>=', $from))
            ->when($filters['to'], fn (Builder $query, string $to) => $query->where('tgl', '<=', $to))
            ->orderByDesc('tgl')
            ->orderByDesc('id');
    }

    /**
     * @param  Collection<int, Category>  $categories
     * @return list<array{id: int, nama: string, info: string|null}>
     */
    private function presentCategories($categories): array
    {
        $list = [];

        foreach ($categories as $category) {
            $list[] = [
                'id' => $category->id,
                'nama' => $category->nama,
                'info' => $category->info,
            ];
        }

        return $list;
    }

    private function bucketLabel(string $bucket, string $period): string
    {
        if ($period === 'tahunan') {
            return 'Tahun '.$bucket;
        }

        if ($period === 'harian') {
            $date = Carbon::createFromFormat('Y-m-d', $bucket);

            return $date->day.' '.self::MONTHS[$date->month - 1].' '.$date->year;
        }

        [$year, $month] = explode('-', $bucket);

        return self::MONTHS[((int) $month) - 1].' '.$year;
    }

    private function dayLabel(CarbonInterface $date): string
    {
        return $date->day.' '.self::MONTHS[$date->month - 1].' '.$date->year;
    }

    /**
     * Conditional sum used to total a single jenis in one pass.
     *
     * @param  'masuk'|'keluar'  $jenis
     * @return literal-string
     */
    private function sumCase(string $jenis): string
    {
        return $jenis === 'masuk'
            ? "COALESCE(SUM(CASE WHEN jenis = 'masuk' THEN nominal ELSE 0 END), 0)"
            : "COALESCE(SUM(CASE WHEN jenis = 'keluar' THEN nominal ELSE 0 END), 0)";
    }

    /**
     * @return literal-string
     */
    private function yearMonth(): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m', tgl)",
            'pgsql' => "to_char(tgl, 'YYYY-MM')",
            'sqlsrv' => "format(tgl, 'yyyy-MM')",
            default => "date_format(tgl, '%Y-%m')",
        };
    }

    /**
     * @return literal-string
     */
    private function year(): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y', tgl)",
            'pgsql' => "to_char(tgl, 'YYYY')",
            'sqlsrv' => "format(tgl, 'yyyy')",
            default => "date_format(tgl, '%Y')",
        };
    }

    /**
     * @return literal-string
     */
    private function dateOnly(): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m-%d', tgl)",
            'pgsql' => "to_char(tgl, 'YYYY-MM-DD')",
            'sqlsrv' => "format(tgl, 'yyyy-MM-dd')",
            default => "date_format(tgl, '%Y-%m-%d')",
        };
    }

    /**
     * @return array{tgl: string, jenis: string, kategori: string, nominal: int, keterangan: string|null}
     */
    private function validateTransaction(Request $request): array
    {
        $validated = $request->validate([
            'tgl' => ['required', 'date'],
            'jenis' => ['required', Rule::in(['masuk', 'keluar'])],
            'kategori' => ['required', 'string', 'max:60'],
            'nominal' => ['required', 'integer', 'min:1'],
            'keterangan' => ['nullable', 'string', 'max:255'],
            'bukti' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ]);

        return [
            'tgl' => $validated['tgl'],
            'jenis' => $validated['jenis'],
            'kategori' => $validated['kategori'],
            'nominal' => (int) $validated['nominal'],
            'keterangan' => $validated['keterangan'] ?? null,
        ];
    }

    private function storeBukti(Request $request): ?string
    {
        if (! $request->hasFile('bukti')) {
            return null;
        }

        $path = $request->file('bukti')->store('bukti', 'public');

        return $path === false ? null : $path;
    }
}
