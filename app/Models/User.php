<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, HasRoles, Notifiable, SoftDeletes, TwoFactorAuthenticatable;

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
        'email_verified_at',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
        'two_factor_enabled',
        'two_factor_backup_codes',
        'name',
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
            'two_factor_enabled' => 'boolean',
        ];
    }

    public function getNameAttribute(): string
    {
        $name = trim(implode(' ', array_filter([
            $this->first_name ?? '',
            $this->middle_name ?? '',
            $this->last_name ?? '',
            $this->suffix ?? '',
        ])));

        return $name !== '' ? $name : ($this->email ?? '');
    }

    public function setNameAttribute(?string $value): void
    {
        if ($value !== null) {
            $parts = explode(' ', trim($value), 2);
            $this->attributes['first_name'] = $parts[0] ?? '';
            $this->attributes['last_name'] = $parts[1] ?? '';
        }
        unset($this->attributes['name']);
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
