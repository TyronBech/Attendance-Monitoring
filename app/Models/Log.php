<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Log extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'log_user_logs';

    protected $primaryKey = 'id';

    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'computer_use',
        'time_in',
        'time_out',
        'remarks',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
