<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, HasRoles, Notifiable, SoftDeletes;

    protected $table = 'usr_users';

    protected $guarded = [];

    public $timestamps = true;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'rfid',
        'privilege_id',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'gender',
        'profile_image',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public static function getTableName()
    {
        return (new self)->getTable();
    }

    public function students(): HasOne
    {
        return $this->hasOne(StudentDetail::class, 'user_id', 'id');
    }

    public function employees(): HasOne
    {
        return $this->hasOne(EmployeeDetail::class, 'user_id', 'id');
    }

    public function visitors(): HasOne
    {
        return $this->hasOne(VisitorDetail::class, 'user_id', 'id');
    }

    public function privileges(): BelongsTo
    {
        return $this->belongsTo(UserGroup::class, 'privilege_id', 'id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(Log::class, 'user_id', 'id');
    }

    protected static function booted()
    {
        static::deleting(function ($user) {
            if (! $user->isForceDeleting()) {
                $user->logs()->delete();
            }
        });
        static::restoring(function ($user) {
            $user->logs()->withTrashed()->restore();
        });
    }
}
