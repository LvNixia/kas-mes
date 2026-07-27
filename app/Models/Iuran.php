<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Iuran extends Model
{
    protected $fillable = [
        'user_id',
        'month',
        'year',
        'amount',
        'transaction_id',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Transaction, $this>
     */
    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
