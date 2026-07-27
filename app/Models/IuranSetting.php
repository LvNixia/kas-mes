<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IuranSetting extends Model
{
    protected $fillable = [
        'month',
        'year',
        'amount',
    ];
}
