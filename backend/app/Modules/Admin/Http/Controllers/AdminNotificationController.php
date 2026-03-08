<?php

namespace App\Modules\Admin\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminNotificationController
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $notifications = DB::table('notifications')
            ->where('notifiable_type', 'App\\Modules\\Auth\\Models\\User')
            ->where('notifiable_id', $userId)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'type' => $n->type,
                'data' => json_decode($n->data, true),
                'read_at' => $n->read_at,
                'created_at' => $n->created_at,
            ]);

        $unreadCount = DB::table('notifications')
            ->where('notifiable_type', 'App\\Modules\\Auth\\Models\\User')
            ->where('notifiable_id', $userId)
            ->whereNull('read_at')
            ->count();

        return ApiResponse::success(['data' => $notifications, 'unread_count' => $unreadCount]);
    }

    public function markAllRead(Request $request)
    {
        DB::table('notifications')
            ->where('notifiable_type', 'App\\Modules\\Auth\\Models\\User')
            ->where('notifiable_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return ApiResponse::success([], 'Notifications marked read');
    }
}
