<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Company::create([
            'name' => 'TodoPoderoso TMS',
            'primary_color' => '#4F46E5', // Indigo 600
            'bg_color' => '#F9FAFB', // Gray 50
            'accent_color' => '#8B5CF6', // Violet 500
        ]);
    }
}
