<?php

namespace App\Modules\Admin\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use Illuminate\Support\Facades\DB;

class ExportController
{
    public function show(int $id)
    {
        $job = DB::table('export_jobs')->find($id);

        if (!$job) {
            return ApiResponse::error('Export job not found', 'NOT_FOUND', [], 404);
        }

        return ApiResponse::success([
            'id' => $job->id,
            'type' => $job->type,
            'status' => $job->status,
            'format' => $job->format,
            'download_url' => $job->download_url,
            'completed_at' => $job->completed_at,
            'created_at' => $job->created_at,
        ]);
    }
}
