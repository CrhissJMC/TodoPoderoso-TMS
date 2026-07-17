<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'primary_color',
        'bg_color',
        'accent_color',
        'logo_path',
        'website_url',
    ];
}
