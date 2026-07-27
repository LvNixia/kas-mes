<?php

namespace App\Models;

use Database\Factories\TransactionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property Carbon $tgl
 * @property string $jenis
 * @property string $kategori
 * @property int $nominal
 * @property string|null $keterangan
 * @property string|null $bukti_path
 */
class Transaction extends Model
{
    /** @use HasFactory<TransactionFactory> */
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
