<?php

namespace App\Http\Controllers;

use App\Models\Iuran;
use App\Models\IuranSetting;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class IuranController extends Controller
{
    /**
     * Display the iuran matrix for a given year.
     */
    public function index(Request $request): Response
    {
        $year = (int) $request->input('year', date('Y'));

        // Only get users who have nama_mes (meaning they are MES members)
        $users = User::whereNotNull('nama_mes')
            ->orderBy('name')
            ->get();

        $iurans = Iuran::where('year', $year)->get();
        $settings = IuranSetting::where('year', $year)->get();

        // Prepare the matrix data
        $matrix = $users->map(function ($user) use ($iurans) {
            $userIurans = $iurans->where('user_id', $user->id)->keyBy('month');

            $monthsData = [];
            for ($month = 1; $month <= 12; $month++) {
                $iuran = $userIurans->get($month);
                $monthsData[$month] = $iuran ? [
                    'id' => $iuran->id,
                    'amount' => $iuran->amount,
                    'transaction_id' => $iuran->transaction_id,
                ] : null;
            }

            return [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'nama_mes' => $user->nama_mes,
                ],
                'months' => $monthsData,
            ];
        });

        // Prepare settings map
        $settingsMap = [];
        for ($month = 1; $month <= 12; $month++) {
            $setting = $settings->where('month', $month)->first();
            $settingsMap[$month] = $setting ? $setting->amount : 0;
        }

        return Inertia::render('iuran/Index', [
            'year' => $year,
            'matrix' => $matrix,
            'settings' => $settingsMap,
        ]);
    }

    /**
     * Store a payment for a specific user, month, and year.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer',
            'amount' => 'required|integer|min:1',
        ]);

        /** @var User $user */
        $user = User::where('id', $validated['user_id'])->firstOrFail();

        // Check if already paid
        $existing = Iuran::where('user_id', $user->id)
            ->where('month', $validated['month'])
            ->where('year', $validated['year'])
            ->first();

        if ($existing) {
            return back()->with('error', 'Iuran untuk bulan ini sudah dibayar.');
        }

        // Create transaction in Kas
        $monthName = Carbon::create()->month((int) $validated['month'])->translatedFormat('F');
        $transaction = Transaction::create([
            'user_id' => $request->user()->id, // The admin/user recording this
            'tgl' => now()->toDateString(),
            'jenis' => 'masuk',
            'kategori' => 'Iuran Anggota',
            'nominal' => $validated['amount'],
            'keterangan' => "Iuran {$monthName} {$validated['year']} - {$user->name} ({$user->nama_mes})",
        ]);

        // Create Iuran record
        Iuran::create([
            'user_id' => $user->id,
            'month' => $validated['month'],
            'year' => $validated['year'],
            'amount' => $validated['amount'],
            'transaction_id' => $transaction->id,
        ]);

        return back()->with('success', 'Pembayaran iuran berhasil dicatat dan masuk ke Kas.');
    }

    /**
     * Delete an iuran payment and its associated kas transaction.
     */
    public function destroy(Iuran $iuran): RedirectResponse
    {
        if ($iuran->transaction_id) {
            Transaction::where('id', $iuran->transaction_id)->delete();
        }
        $iuran->delete();

        return back()->with('success', 'Data pembayaran iuran berhasil dihapus.');
    }

    /**
     * Update target amount for a specific month and year.
     */
    public function updateSetting(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer',
            'amount' => 'required|integer|min:0',
        ]);

        IuranSetting::updateOrCreate(
            ['month' => $validated['month'], 'year' => $validated['year']],
            ['amount' => $validated['amount']]
        );

        return back()->with('success', 'Target nominal iuran berhasil diperbarui.');
    }
}
