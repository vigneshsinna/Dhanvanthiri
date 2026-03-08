<?php

namespace App\Modules\Shared\Http\Resources;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(array $data = [], string $message = 'OK', int $status = 200): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'code' => 'SUCCESS',
            'data' => $data,
            'trace_id' => request()->header('X-Trace-Id') ?? null,
        ], $status);
    }

    public static function error(string $message, string $code, array $errors = [], int $status = 422): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'code' => $code,
            'errors' => $errors,
            'trace_id' => request()->header('X-Trace-Id') ?? null,
        ], $status);
    }
}
