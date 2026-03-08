<?php

namespace App\Modules\Admin\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\Admin\Models\AdminActivityLog;
use Illuminate\Http\Request;

class ActivityLogController
{
    public function index(Request $request)
    {
        $query = AdminActivityLog::with('user:id,name,email')->orderByDesc('created_at');

        if ($action = $request->input('action')) {
            $query->where('action', $action);
        }
        if ($entity = $request->input('entity_type')) {
            $query->where('entity_type', $entity);
        }
        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        $logs = $query->paginate($request->integer('per_page', 20));

        return ApiResponse::success([
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total(),
            ],
        ]);
    }
}
