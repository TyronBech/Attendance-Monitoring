<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeDetail extends Model
{
  use HasFactory, SoftDeletes;
  protected $table = 'usr_employee_details';
  protected $primaryKey = 'id';
  public $timestamps = true;
  protected $fillable = [
    'user_id',
    'employee_id',
    'employee_role',
  ];
  public function users(): BelongsTo
  {
    return $this->belongsTo(User::class, 'user_id', 'id');
  }
}
