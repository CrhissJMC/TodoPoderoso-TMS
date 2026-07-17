<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckLicenseExpiration
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();

            if ($user->role && $user->role->name === 'chofer') {
                $driver = $user->driver;

                if ($driver && $driver->isLicenseExpired()) {
                    // Si intenta acceder a rutas que no son de renovacion o logout
                    if (! $request->routeIs('driver.license.renew') && ! $request->routeIs('logout')) {
                        return redirect()->route('driver.license.renew');
                    }
                }
            }
        }

        return $next($request);
    }
}
