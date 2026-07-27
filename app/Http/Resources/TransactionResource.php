<?php

namespace App\Http\Resources;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin Transaction
 */
class TransactionResource extends JsonResource
{
    /**
     * Indonesian short month labels, indexed by month number - 1.
     *
     * @var list<string>
     */
    private const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $month = self::MONTHS[$this->tgl->month - 1];

        return [
            'id' => $this->id,
            'tgl' => $this->tgl->format('Y-m-d'),
            'tgl_label' => $this->tgl->day.' '.$month,
            'tgl_full' => $this->tgl->day.' '.$month.' '.substr((string) $this->tgl->year, 2),
            'jenis' => $this->jenis,
            'kategori' => $this->kategori,
            'nominal' => $this->nominal,
            'keterangan' => $this->keterangan,
            'bukti_nama' => $this->bukti_path ? basename($this->bukti_path) : null,
            'bukti_url' => $this->bukti_path ? Storage::url($this->bukti_path) : null,
        ];
    }
}
