<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

it('redirects guests away from kas', function () {
    get('/kas')->assertRedirect('/login');
});

it('renders the kas page with data', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->masuk()->create(['nominal' => 1000]);
    Category::factory()->for($user)->create(['jenis' => 'masuk', 'nama' => 'Iuran']);

    actingAs($user)
        ->get('/kas')
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('kas/index')
                ->has('transactions.data', 1)
                ->has('categories.masuk', 1)
                ->where('settings.nama_mes', fn ($v) => is_string($v))
        );
});

it('aggregates the summary in the database', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->masuk()->create(['nominal' => 900]);
    Transaction::factory()->for($user)->masuk()->create(['nominal' => 100]);
    Transaction::factory()->for($user)->keluar()->create(['nominal' => 250]);

    actingAs($user)->get('/kas')->assertInertia(
        fn ($page) => $page
            ->where('summary.masuk', 1000)
            ->where('summary.keluar', 250)
            ->where('summary.saldo', 750)
    );
});

it('scopes the summary to the signed in user', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->masuk()->create(['nominal' => 500]);
    Transaction::factory()->for(User::factory())->masuk()->create(['nominal' => 9999]);

    actingAs($user)->get('/kas')->assertInertia(
        fn ($page) => $page->where('summary.masuk', 500)
    );
});

it('builds bars for the last seven months relative to today', function () {
    $this->travelTo('2026-07-15');
    $user = User::factory()->create();

    actingAs($user)->get('/kas')->assertInertia(
        fn ($page) => $page
            ->has('bars', 7)
            ->where('bars.0.key', '2026-01')
            ->where('bars.0.label', 'Jan')
            ->where('bars.6.key', '2026-07')
            ->where('bars.6.label', 'Jul')
    );
});

it('rolls the bar window into the next year', function () {
    $this->travelTo('2027-02-10');
    $user = User::factory()->create();

    actingAs($user)->get('/kas')->assertInertia(
        fn ($page) => $page
            ->where('bars.0.key', '2026-08')
            ->where('bars.6.key', '2027-02')
    );
});

it('keeps same-month transactions from different years apart', function () {
    $this->travelTo('2026-07-15');
    $user = User::factory()->create();
    Transaction::factory()->for($user)->masuk()->create(['tgl' => '2026-07-01', 'nominal' => 700]);
    Transaction::factory()->for($user)->masuk()->create(['tgl' => '2025-07-01', 'nominal' => 5000]);

    actingAs($user)->get('/kas')->assertInertia(
        fn ($page) => $page->where('bars.6.masuk', 700)
    );
});

it('labels report buckets with their real year', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->masuk()->create(['tgl' => '2025-03-04', 'nominal' => 300]);
    Transaction::factory()->for($user)->keluar()->create(['tgl' => '2025-03-06', 'nominal' => 100]);

    actingAs($user)->get('/kas?period=bulanan')->assertInertia(
        fn ($page) => $page
            ->where('period', 'bulanan')
            ->where('report.0.label', 'Mar 2025')
            ->where('report.0.masuk', 300)
            ->where('report.0.keluar', 100)
            ->where('report.0.selisih', 200)
            ->where('report.0.n', 2)
    );

    actingAs($user)->get('/kas?period=tahunan')->assertInertia(
        fn ($page) => $page->where('report.0.label', 'Tahun 2025')
    );

    actingAs($user)->get('/kas?period=harian')->assertInertia(
        fn ($page) => $page->where('report.0.label', '6 Mar 2025')
    );
});

it('falls back to the monthly report for an unknown period', function () {
    actingAs(User::factory()->create())
        ->get('/kas?period=mingguan')
        ->assertInertia(fn ($page) => $page->where('period', 'bulanan'));
});

it('filters the riwayat list in the database', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->masuk()->create(['keterangan' => 'Iuran Juli kamar 3']);
    Transaction::factory()->for($user)->keluar()->create(['keterangan' => 'Belanja pasar']);

    actingAs($user)->get('/kas?q=kamar')->assertInertia(
        fn ($page) => $page
            ->has('transactions.data', 1)
            ->where('transactions.data.0.keterangan', 'Iuran Juli kamar 3')
            ->where('filters.q', 'kamar')
            ->where('total', 2)
    );

    actingAs($user)->get('/kas?jenis=keluar')->assertInertia(
        fn ($page) => $page
            ->has('transactions.data', 1)
            ->where('transactions.data.0.jenis', 'keluar')
    );
});

it('filters the riwayat list by category', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->create(['kategori' => 'Belanja Dapur']);
    Transaction::factory()->for($user)->create(['kategori' => 'Listrik & Air']);

    actingAs($user)->get('/kas?kategori=Listrik+%26+Air')->assertInertia(
        fn ($page) => $page
            ->has('transactions.data', 1)
            ->where('transactions.data.0.kategori', 'Listrik & Air')
            ->where('filters.kategori', 'Listrik & Air')
    );
});

it('exposes the stat counts and report totals', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->masuk()->count(3)->create(['nominal' => 100]);
    Transaction::factory()->for($user)->keluar()->count(2)->create(['nominal' => 50]);

    actingAs($user)->get('/kas')->assertInertia(
        fn ($page) => $page
            ->where('counts.masuk', 3)
            ->where('counts.keluar', 2)
            ->where('reportTotal.n', 5)
            ->where('reportTotal.masuk', 300)
            ->where('reportTotal.keluar', 100)
            ->where('reportTotal.selisih', 200)
    );
});

it('stores a category with its description', function () {
    $user = User::factory()->create();

    actingAs($user)->post('/kas/categories', [
        'nama' => 'Parkir',
        'jenis' => 'masuk',
        'info' => 'Retribusi parkir penghuni',
    ])->assertRedirect();

    expect($user->categories()->first()->info)->toBe('Retribusi parkir penghuni');

    actingAs($user)->get('/kas')->assertInertia(
        fn ($page) => $page->where('categories.masuk.0.info', 'Retribusi parkir penghuni')
    );
});

it('saves the address alongside the other mes settings', function () {
    $user = User::factory()->create();

    actingAs($user)->patch('/kas/settings', [
        'nama_mes' => 'Mes Baru',
        'alamat' => 'Jl. Melati No. 21',
        'telp' => '0812',
    ])->assertRedirect();

    expect($user->fresh()->alamat)->toBe('Jl. Melati No. 21');
});

it('labels transaction dates for both layouts', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->create(['tgl' => '2026-03-09']);

    actingAs($user)->get('/kas')->assertInertia(
        fn ($page) => $page
            ->where('transactions.data.0.tgl_label', '9 Mar')
            ->where('transactions.data.0.tgl_full', '9 Mar 26')
    );
});

it('filters the riwayat list by date range', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->create(['tgl' => '2026-05-10']);
    Transaction::factory()->for($user)->create(['tgl' => '2026-07-10']);

    actingAs($user)->get('/kas?from=2026-06-01&to=2026-12-31')->assertInertia(
        fn ($page) => $page
            ->has('transactions.data', 1)
            ->where('transactions.data.0.tgl', '2026-07-10')
    );
});

it('ignores a malformed date filter instead of failing', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->create();

    actingAs($user)
        ->get('/kas?from=bukan-tanggal')
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->where('filters.from', null)
                ->has('transactions.data', 1)
        );
});

it('paginates the riwayat list', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->count(25)->create();

    actingAs($user)->get('/kas')->assertInertia(
        fn ($page) => $page
            ->has('transactions.data', 20)
            ->where('transactions.meta.total', 25)
            ->where('total', 25)
    );

    actingAs($user)->get('/kas?page=2')->assertInertia(
        fn ($page) => $page->has('transactions.data', 5)
    );
});

it('runs a constant number of queries regardless of transaction volume', function () {
    $count = function (User $user): int {
        $queries = 0;
        DB::listen(function () use (&$queries): void {
            $queries++;
        });

        actingAs($user)->get('/kas')->assertOk();

        return $queries;
    };

    $small = User::factory()->create();
    Transaction::factory()->for($small)->count(10)->create();

    $large = User::factory()->create();
    Transaction::factory()->for($large)->count(200)->create();

    expect($count($large))->toBe($count($small));
});

it('downloads a backup of the signed in user only', function () {
    $user = User::factory()->create(['nama_mes' => 'Mes Griya Asri', 'telp' => '0812']);
    Category::factory()->for($user)->create(['nama' => 'Iuran', 'jenis' => 'masuk', 'info' => 'Bulanan']);
    Transaction::factory()->for($user)->masuk()->create(['tgl' => '2026-07-24', 'nominal' => 500]);
    Transaction::factory()->for(User::factory())->create(['nominal' => 9999]);

    $response = actingAs($user)->get('/kas/backup')->assertOk();

    expect($response->headers->get('content-disposition'))->toContain('.json');

    $data = json_decode($response->streamedContent(), true);

    expect($data['app'])->toBe('kas-mes');
    expect($data['settings']['nama_mes'])->toBe('Mes Griya Asri');
    expect($data['categories'])->toHaveCount(1);
    expect($data['transactions'])->toHaveCount(1);
    expect($data['transactions'][0]['nominal'])->toBe(500);
});

it('restores a backup over the existing data', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->count(3)->create();
    Category::factory()->for($user)->create();

    $backup = [
        'app' => 'kas-mes',
        'version' => 1,
        'settings' => ['nama_mes' => 'Mes Pulih', 'alamat' => 'Jl. Baru 1', 'telp' => '0899'],
        'categories' => [['nama' => 'Iuran', 'jenis' => 'masuk', 'info' => 'Bulanan']],
        'transactions' => [
            ['tgl' => '2026-01-05', 'jenis' => 'masuk', 'kategori' => 'Iuran', 'nominal' => 1000, 'keterangan' => 'Awal tahun'],
            ['tgl' => '2026-02-05', 'jenis' => 'keluar', 'kategori' => 'Iuran', 'nominal' => 400, 'keterangan' => null],
        ],
    ];

    actingAs($user)->post('/kas/restore', [
        'file' => UploadedFile::fake()->createWithContent('cadangan.json', json_encode($backup)),
    ])->assertRedirect();

    $user->refresh();

    expect($user->transactions()->count())->toBe(2);
    expect($user->categories()->count())->toBe(1);
    expect($user->nama_mes)->toBe('Mes Pulih');
    expect($user->alamat)->toBe('Jl. Baru 1');
    expect($user->transactions()->sum('nominal'))->toBe(1400);
});

it('deletes stored proof files when restoring', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    actingAs($user)->post('/kas/transactions', [
        'tgl' => '2026-07-20',
        'jenis' => 'keluar',
        'kategori' => 'Belanja Dapur',
        'nominal' => 250000,
        'bukti' => UploadedFile::fake()->image('nota.jpg'),
    ]);

    $path = $user->transactions()->first()->bukti_path;
    Storage::disk('public')->assertExists($path);

    actingAs($user)->post('/kas/restore', [
        'file' => UploadedFile::fake()->createWithContent(
            'cadangan.json',
            json_encode(['app' => 'kas-mes', 'version' => 1, 'transactions' => []]),
        ),
    ])->assertRedirect();

    Storage::disk('public')->assertMissing($path);
});

it('rejects a file that is not a kas mes backup', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->create();

    actingAs($user)->post('/kas/restore', [
        'file' => UploadedFile::fake()->createWithContent('lain.json', json_encode(['app' => 'lain'])),
    ])->assertSessionHasErrors('file');

    expect($user->transactions()->count())->toBe(1);
});

it('rejects a backup with malformed rows and keeps the old data', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->create();

    actingAs($user)->post('/kas/restore', [
        'file' => UploadedFile::fake()->createWithContent('rusak.json', json_encode([
            'app' => 'kas-mes',
            'transactions' => [['tgl' => 'bukan-tanggal', 'jenis' => 'masuk', 'kategori' => 'X', 'nominal' => 0]],
        ])),
    ])->assertSessionHasErrors();

    expect($user->transactions()->count())->toBe(1);
});

it('keeps backup and restore behind authentication', function () {
    get('/kas/backup')->assertRedirect('/login');
});

it('caps the beranda list at four recent transactions', function () {
    $user = User::factory()->create();
    Transaction::factory()->for($user)->count(6)->create();

    actingAs($user)->get('/kas')->assertInertia(fn ($page) => $page->has('recent', 4));
});

it('stores a transaction', function () {
    $user = User::factory()->create();

    actingAs($user)->post('/kas/transactions', [
        'tgl' => '2026-07-20',
        'jenis' => 'masuk',
        'kategori' => 'Iuran Bulanan',
        'nominal' => 500000,
        'keterangan' => 'Iuran Juli',
    ])->assertRedirect();

    expect($user->transactions()->count())->toBe(1);
    expect($user->transactions()->first()->nominal)->toBe(500000);
});

it('stores a transaction with proof file', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    actingAs($user)->post('/kas/transactions', [
        'tgl' => '2026-07-20',
        'jenis' => 'keluar',
        'kategori' => 'Belanja Dapur',
        'nominal' => 250000,
        'bukti' => UploadedFile::fake()->image('nota.jpg'),
    ])->assertRedirect();

    $tx = $user->transactions()->first();
    expect($tx->bukti_path)->not->toBeNull();
    Storage::disk('public')->assertExists($tx->bukti_path);
});

it('requires a positive nominal', function () {
    $user = User::factory()->create();

    actingAs($user)->post('/kas/transactions', [
        'tgl' => '2026-07-20',
        'jenis' => 'masuk',
        'kategori' => 'Iuran',
        'nominal' => 0,
    ])->assertSessionHasErrors('nominal');

    expect($user->transactions()->count())->toBe(0);
});

it('updates a transaction', function () {
    $user = User::factory()->create();
    $tx = Transaction::factory()->for($user)->create(['nominal' => 100]);

    actingAs($user)->post("/kas/transactions/{$tx->id}", [
        'tgl' => '2026-07-21',
        'jenis' => 'masuk',
        'kategori' => 'Iuran',
        'nominal' => 999,
    ])->assertRedirect();

    expect($tx->fresh()->nominal)->toBe(999);
});

it('forbids editing another users transaction', function () {
    $tx = Transaction::factory()->for(User::factory())->create();

    actingAs(User::factory()->create())
        ->post("/kas/transactions/{$tx->id}", [
            'tgl' => '2026-07-21',
            'jenis' => 'masuk',
            'kategori' => 'Iuran',
            'nominal' => 999,
        ])
        ->assertForbidden();
});

it('deletes a transaction', function () {
    $user = User::factory()->create();
    $tx = Transaction::factory()->for($user)->create();

    actingAs($user)->delete("/kas/transactions/{$tx->id}")->assertRedirect();

    expect(Transaction::find($tx->id))->toBeNull();
});

it('stores and removes categories', function () {
    $user = User::factory()->create();

    actingAs($user)->post('/kas/categories', ['nama' => 'Parkir', 'jenis' => 'masuk'])->assertRedirect();
    $cat = $user->categories()->firstOrFail();
    expect($cat->nama)->toBe('Parkir');

    actingAs($user)->delete("/kas/categories/{$cat->id}")->assertRedirect();
    expect($user->categories()->count())->toBe(0);
});

it('updates mes settings', function () {
    $user = User::factory()->create();

    actingAs($user)->patch('/kas/settings', ['nama_mes' => 'Mes Baru', 'telp' => '0812'])->assertRedirect();

    expect($user->fresh()->nama_mes)->toBe('Mes Baru');
    expect($user->fresh()->telp)->toBe('0812');
});
