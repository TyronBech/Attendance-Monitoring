<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VisitorDetail extends Model
{
  use HasFactory, SoftDeletes;
  protected $table = 'usr_visitor_details';
  protected $primaryKey = 'id';
  public $timestamps = true;
  protected $fillable = [
    'user_id',
    'school_org',
    'purpose',
  ];
  public function users(): BelongsTo
  {
    return $this->belongsTo(User::class, 'user_id', 'id');
  }
}
