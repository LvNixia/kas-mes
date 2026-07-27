<?php

use App\Models\Iuran;
use App\Models\Transaction;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

beforeEach(function () {
    $this->admin = User::factory()->create([
        'nama_mes' => 'Admin MES',
    ]);

    $this->member = User::factory()->create([
        'nama_mes' => 'Member MES 1',
    ]);
});

test('can view iuran index page', function () {
    actingAs($this->admin)
        ->get(route('iuran.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('iuran/Index'));
});

test('can set target iuran setting', function () {
    actingAs($this->admin)
        ->post(route('iuran.settings.update'), [
            'month' => 1,
            'year' => 2026,
            'amount' => 50000,
        ])
        ->assertRedirect();

    assertDatabaseHas('iuran_settings', [
        'month' => 1,
        'year' => 2026,
        'amount' => 50000,
    ]);
});

test('can record iuran payment and it creates transaction', function () {
    actingAs($this->admin)
        ->post(route('iuran.store'), [
            'user_id' => $this->member->id,
            'month' => 1,
            'year' => 2026,
            'amount' => 50000,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    assertDatabaseHas('iurans', [
        'user_id' => $this->member->id,
        'month' => 1,
        'year' => 2026,
        'amount' => 50000,
    ]);

    assertDatabaseHas('transactions', [
        'user_id' => $this->admin->id,
        'jenis' => 'masuk',
        'kategori' => 'Iuran Anggota',
        'nominal' => 50000,
    ]);
});

test('can delete iuran and its transaction', function () {
    $transaction = Transaction::create([
        'user_id' => $this->admin->id,
        'tgl' => now()->toDateString(),
        'jenis' => 'masuk',
        'kategori' => 'Iuran Anggota',
        'nominal' => 50000,
        'keterangan' => 'Test',
    ]);

    $iuran = Iuran::create([
        'user_id' => $this->member->id,
        'month' => 1,
        'year' => 2026,
        'amount' => 50000,
        'transaction_id' => $transaction->id,
    ]);

    actingAs($this->admin)
        ->delete(route('iuran.destroy', $iuran->id))
        ->assertRedirect()
        ->assertSessionHas('success');

    assertDatabaseMissing('iurans', [
        'id' => $iuran->id,
    ]);

    assertDatabaseMissing('transactions', [
        'id' => $transaction->id,
    ]);
});
