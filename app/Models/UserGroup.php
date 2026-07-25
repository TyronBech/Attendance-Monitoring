<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserGroup extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'privileges';

    protected $primaryKey = 'id';

    public $timestamps = true;

    protected $fillable = [
        'user_type',
        'category',
        'max_book_allowed',
        'duration_type',
        'renewal_limit',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'privilege_id', 'id');
    }
}
