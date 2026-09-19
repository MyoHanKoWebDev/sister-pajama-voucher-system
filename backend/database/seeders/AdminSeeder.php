<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Seed a local development admin. Password comes from .env.
     */
    public function run(): void
    {
        if (! app()->environment(['local', 'development'])) {
            return;
        }

        Admin::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'System Admin',
                // Hashed by Admin::setPasswordAttribute — never stored as plain text.
                'password' => env('ADMIN_DEV_PASSWORD', 'password'),
            ]
        );
    }
}
