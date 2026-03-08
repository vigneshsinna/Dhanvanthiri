<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => App\Modules\Shared\Http\Middleware\RoleMiddleware::class,
            'cart.session' => App\Modules\CartCheckout\Http\Middleware\CartSessionMiddleware::class,
            'idempotency' => App\Modules\Shared\Http\Middleware\IdempotencyMiddleware::class,
            'module.enabled' => App\Modules\Shared\Http\Middleware\FeatureModuleEnabledMiddleware::class,
        ]);

        $middleware->api(prepend: [
            App\Modules\Shared\Http\Middleware\TraceIdMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $e, $request) {
            if (!$request->is('api/*')) {
                return null;
            }

            if ($e instanceof ValidationException) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'code' => 'VALIDATION_ERROR',
                    'errors' => $e->errors(),
                    'trace_id' => $request->header('X-Trace-Id'),
                ], 422);
            }

            if ($e instanceof AuthenticationException) {
                return response()->json([
                    'message' => 'Unauthenticated',
                    'code' => 'UNAUTHENTICATED',
                    'errors' => [],
                    'trace_id' => $request->header('X-Trace-Id'),
                ], 401);
            }

            if ($e instanceof ModelNotFoundException) {
                return response()->json([
                    'message' => 'Resource not found',
                    'code' => 'NOT_FOUND',
                    'errors' => [],
                    'trace_id' => $request->header('X-Trace-Id'),
                ], 404);
            }

            $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;
            $message = $status >= 500 ? 'Internal server error' : $e->getMessage();

            return response()->json([
                'message' => $message,
                'code' => $status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
                'errors' => [],
                'trace_id' => $request->header('X-Trace-Id'),
            ], $status);
        });
    })
    ->create();
