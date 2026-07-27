<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $jenis = fake()->randomElement(['masuk', 'keluar']);

        return [
            'user_id' => User::factory(),
            'tgl' => fake()->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
            'jenis' => $jenis,
            'kategori' => $jenis === 'masuk' ? 'Iuran Bulanan' : 'Belanja Dapur',
            'nominal' => fake()->numberBetween(500_000, 20_000_000),
            'keterangan' => fake()->sentence(4),
            'bukti_path' => null,
        ];
    }

    public function masuk(): static
    {
        return $this->state(['jenis' => 'masuk', 'kategori' => 'Iuran Bulanan']);
    }

    public function keluar(): static
    {
        return $this->state(['jenis' => 'keluar', 'kategori' => 'Belanja Dapur']);
    }
}
