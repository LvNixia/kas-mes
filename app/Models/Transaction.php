<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon $tgl
 * @property string $jenis
 * @property string $kategori
 * @property int $nominal
 * @property string|null $keterangan
 * @property string|null $bukti_path
 */
class Transaction extends Model
{
    /** @use HasFactory<\Database\Factories\TransactionFactory> */
    use HasFactory;

    protected $fillable = ['user_id', 'tgl', 'jenis', 'kategori', 'nominal', 'keterangan', 'bukti_path'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tgl' => 'date',
            'nominal' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
