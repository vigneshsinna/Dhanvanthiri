<?php

namespace App\Modules\OrderManagement\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\OrderManagement\Models\ReturnRequest;
use App\Modules\OrderManagement\Services\CustomerNotificationService;
use Illuminate\Http\Request;

class AdminReturnController
{
    public function index(Request $request)
    {
        $query = ReturnRequest::with(['order:id,order_number', 'user:id,name,email', 'items'])
            ->orderByDesc('created_at');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $returns = $query->paginate($request->integer('per_page', 15));

        return ApiResponse::success([
            'data' => $returns->items(),
            'meta' => [
                'current_page' => $returns->currentPage(),
                'last_page' => $returns->lastPage(),
                'total' => $returns->total(),
            ],
        ]);
    }

    public function update(Request $request, int $id)
    {
        $data = $request->validate([
            'status' => 'required|in:approved,rejected,completed',
            'admin_notes' => 'nullable|string',
        ]);

        $returnReq = ReturnRequest::findOrFail($id);
        $returnReq->status = $data['status'];
        $returnReq->admin_notes = $data['admin_notes'] ?? $returnReq->admin_notes;

        if (in_array($data['status'], ['approved', 'rejected', 'completed'])) {
            $returnReq->resolved_at = now();
        }

        $returnReq->save();

        // Send customer notification for approve/reject
        $order = $returnReq->order;
        if ($order && in_array($data['status'], ['approved', 'rejected'])) {
            $type = $data['status'] === 'approved' ? 'return_approved' : 'return_rejected';
            app(CustomerNotificationService::class)->notify($order, $type);
        }

        return ApiResponse::success(['data' => $returnReq->load('items', 'order:id,order_number')], 'Return updated');
    }
}
