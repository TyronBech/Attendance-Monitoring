<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudentDetail extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'usr_student_details';

    protected $primaryKey = 'id';

    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'id_number',
        'level',
        'section',
    ];

    public function users(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
