<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL; // <-- Agregamos esta línea para las URLs
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Esto es lo que ya tenías
        Vite::prefetch(concurrency: 3);

        // Esto es lo nuevo para que Cloudflare y Tailwind funcionen juntos
        if (config('app.env') !== 'local' || request()->server('HTTP_X_FORWARDED_PROTO') == 'https') {
            URL::forceScheme('https');
        }
    }
}