<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportProgress extends Model
{
    protected $table = 'import_progress';

    protected $fillable = [
        'type',
        'status',
        'initiated_by',
        'total_rows',
        'processed_rows',
        'new_count',
        'updated_count',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'total_rows' => 'integer',
            'processed_rows' => 'integer',
            'new_count' => 'integer',
            'updated_count' => 'integer',
        ];
    }

    public function initiator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiated_by', 'id');
    }
}
