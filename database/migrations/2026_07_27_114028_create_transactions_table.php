<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
            $table->date('tgl');
            $table->enum('jenis', ['masuk', 'keluar']);
            $table->string('kategori');
            $table->unsignedBigInteger('nominal');
            $table->text('keterangan')->nullable();
            $table->string('bukti_path')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'tgl']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
