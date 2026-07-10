<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! Auth::check()) {
            return redirect('login');
        }

        $user = $request->user();

        if (! $user->role || $user->role->name !== $role) {
            abort(403, 'Unauthorized. This role is required.');
        }

        return $next($request);
    }
}
