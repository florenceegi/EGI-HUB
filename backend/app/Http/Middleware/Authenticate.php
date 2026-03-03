<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

/**
 * @package App\Http\Middleware
 * @author Padmin D. Curtis (AI Partner OS3.0) for Fabio Cherici
 * @version 1.0.0 (FlorenceEGI - EGI-HUB)
 * @date 2026-03-03
 * @purpose Override del middleware Authenticate per API-only app.
 *          Restituisce sempre null dal redirectTo() per evitare
 *          l'eccezione "Route [login] not defined" e garantire
 *          una risposta JSON 401 per tutte le richieste non autenticate.
 */
class Authenticate extends Middleware {
    /**
     * Restituisce null per non tentare redirect (API-only app).
     * Senza questa override, Laravel tenta route('login') → RouteNotFoundException.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function redirectTo(Request $request): ?string {
        return null;
    }
}
