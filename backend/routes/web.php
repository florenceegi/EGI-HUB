<?php

use Illuminate\Support\Facades\Route;

// SPA catch-all: tutte le route non-API rispondono con la stessa view
// oppure con JSON 401 per le richieste non autenticate.
// La route 'login' è necessaria come fallback per il middleware Authenticate
// (nonostante l'app sia API-only, alcuni path web triggherano il guard).
Route::get('/login', function () {
    return response()->json(['message' => 'Please authenticate via the SPA.'], 401);
})->name('login');

Route::get('/{any?}', function () {
    return response()->json(['message' => 'EGI-HUB API. Use /api/* endpoints.'], 200);
})->where('any', '.*');
