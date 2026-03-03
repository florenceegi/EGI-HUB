<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Helpers\EarlyEnvironmentHelper;
use Illuminate\Auth\AuthenticationException;


// 🔐 Carica le variabili di ambiente critiche prima del bootstrap
EarlyEnvironmentHelper::loadCriticalEnvironmentVariables(dirname(__DIR__));


return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Override del middleware auth per evitare route('login') non trovata
        // In un'app API-only, redirectTo() deve restituire null
        $middleware->alias([
            'auth'             => \App\Http\Middleware\Authenticate::class,
            'project.access'   => \App\Http\Middleware\ProjectAccess::class,
            'project.permission' => \App\Http\Middleware\ProjectPermission::class,
            'super.admin'      => \App\Http\Middleware\SuperAdminOnly::class,
            'ensure.2fa'       => \App\Http\Middleware\EnsureTwoFactorPassed::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // API-only: AuthenticationException restituisce sempre JSON 401
        // senza tentare route('login') che non esiste → evita RouteNotFoundException
        $exceptions->render(function (AuthenticationException $e, \Illuminate\Http\Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
        });

        $exceptions->reportable(function (Throwable $e) {
            try {
                // Tenta di risolvere UEM dal container e tracciare l'errore
                $errorManager = app(\Ultra\ErrorManager\Interfaces\ErrorManagerInterface::class);
                $errorManager->handle('GENERIC_ERROR', [
                    'log_category' => 'GLOBAL_EXCEPTION_HANDLER',
                    'exception_class' => get_class($e),
                ], $e);
            } catch (\Throwable $loggingException) {
                // Fallback estremo se UEM fallisce (es. DB down)
                // Laravel userà il logger di default configurato in logging.php
            }
        });
    })->create();
