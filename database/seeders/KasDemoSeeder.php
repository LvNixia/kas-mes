<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class KasDemoSeeder extends Seeder
{
    /**
     * Seed a demo bendahara account with categories and transactions.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'bendahara@mesgriya.id'],
            [
                'name' => 'Bendahara Mes',
                'nama_mes' => 'Mes Griya Asri',
                'alamat' => 'Jl. Melati No. 21, Bandung (Mes Putra)',
                'telp' => '0812-3344-5566',
                'password' => 'rahasia123',
                'email_verified_at' => now(),
            ],
        );

        $catIn = [
            ['Iuran Bulanan', 'Iuran tetap penghuni mes'],
            ['Uang Makan Harian', 'Setoran konsumsi harian'],
            ['Denda & Lainnya', 'Denda telat, deposit, dll'],
        ];

        $catOut = [
            ['Belanja Dapur', 'Bahan makanan dan konsumsi'],
            ['Listrik & Air', 'Tagihan bulanan mes'],
            ['Gaji Juru Masak', 'Upah pengelola dapur'],
            ['Kebersihan & Perbaikan', 'Servis, cat, alat kebersihan'],
        ];

        foreach ([['masuk', $catIn], ['keluar', $catOut]] as [$jenis, $list]) {
            foreach ($list as [$nama, $info]) {
                $user->categories()->firstOrCreate(
                    ['nama' => $nama, 'jenis' => $jenis],
                    ['info' => $info],
                );
            }
        }

        if ($user->transactions()->exists()) {
            return;
        }

        $tx = [
            ['2026-07-24', 'masuk', 'Iuran Bulanan', 4850000, 'Iuran Juli 10 penghuni'],
            ['2026-07-23', 'keluar', 'Belanja Dapur', 2740000, 'Belanja mingguan pasar'],
            ['2026-07-22', 'masuk', 'Uang Makan Harian', 1320000, 'Setoran uang makan minggu ke-4'],
            ['2026-07-20', 'keluar', 'Listrik & Air', 1850000, 'Tagihan listrik dan PDAM Juli'],
            ['2026-07-18', 'keluar', 'Gaji Juru Masak', 5200000, 'Gaji juru masak dan asisten'],
            ['2026-07-15', 'masuk', 'Iuran Bulanan', 6120000, 'Pelunasan iuran tertunggak'],
            ['2026-06-28', 'masuk', 'Iuran Bulanan', 18450000, 'Rekap iuran Juni'],
            ['2026-06-14', 'keluar', 'Kebersihan & Perbaikan', 3210000, 'Servis pompa air dan cat kamar'],
            ['2026-05-30', 'masuk', 'Iuran Bulanan', 16200000, 'Rekap iuran Mei'],
            ['2026-05-12', 'keluar', 'Belanja Dapur', 7400000, 'Stok beras dan bahan pokok'],
            ['2026-04-27', 'masuk', 'Denda & Lainnya', 2100000, 'Denda keterlambatan iuran'],
            ['2026-04-11', 'keluar', 'Gaji Juru Masak', 5200000, 'Gaji April'],
            ['2026-03-19', 'masuk', 'Iuran Bulanan', 13800000, 'Rekap iuran Maret'],
            ['2026-02-22', 'masuk', 'Iuran Bulanan', 11500000, 'Rekap iuran Februari'],
            ['2026-01-25', 'masuk', 'Iuran Bulanan', 9800000, 'Rekap iuran Januari'],
        ];

        foreach ($tx as [$tgl, $jenis, $kategori, $nominal, $ket]) {
            $user->transactions()->create([
                'tgl' => $tgl,
                'jenis' => $jenis,
                'kategori' => $kategori,
                'nominal' => $nominal,
                'keterangan' => $ket,
            ]);
        }
    }
}
