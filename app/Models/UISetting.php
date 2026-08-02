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

    protected $appends = [
        'org_logo_base64',
        'org_logo_full_base64',
    ];

    /**
     * Return org_logo as base64 data URL (handles data URI, base64 string, or raw binary)
     */
    public function getOrgLogoBase64Attribute(): ?string
    {
        if (! $this->org_logo) {
            return null;
        }

        if (str_starts_with($this->org_logo, 'data:')) {
            return $this->org_logo;
        }

        $decoded = base64_decode($this->org_logo, true);
        if ($decoded !== false && base64_encode($decoded) === $this->org_logo) {
            return 'data:image/png;base64,'.$this->org_logo;
        }

        return 'data:image/png;base64,'.base64_encode($this->org_logo);
    }

    /**
     * Return org_logo_full as base64 data URL (handles data URI, base64 string, or raw binary)
     */
    public function getOrgLogoFullBase64Attribute(): ?string
    {
        if (! $this->org_logo_full) {
            return null;
        }

        if (str_starts_with($this->org_logo_full, 'data:')) {
            return $this->org_logo_full;
        }

        $decoded = base64_decode($this->org_logo_full, true);
        if ($decoded !== false && base64_encode($decoded) === $this->org_logo_full) {
            return 'data:image/png;base64,'.$this->org_logo_full;
        }

        return 'data:image/png;base64,'.base64_encode($this->org_logo_full);
    }
}
