<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UISetting extends Model
{
    use SoftDeletes;

    protected $table = 'ui_settings';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'org_name',
        'org_initial',
        'org_address',
        'org_logo',
        'org_logo_full',
        'email',
        'contact_number',
        'social_links',
        'theme_colors',
    ];

    protected $casts = [
        'social_links' => 'array',
        'theme_colors' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Return org_logo as base64 data URL (if stored raw)
     */
    public function getOrgLogoBase64Attribute()
    {
        if (!$this->org_logo) {
            return null;
        }

        return 'data:image/png;base64,' . $this->org_logo;
    }

    /**
     * Return org_logo_full as base64 data URL (if stored raw)
     */
    public function getOrgLogoFullBase64Attribute()
    {
        if (!$this->org_logo_full) {
            return null;
        }

        return 'data:image/png;base64,' . $this->org_logo_full;
    }
}
