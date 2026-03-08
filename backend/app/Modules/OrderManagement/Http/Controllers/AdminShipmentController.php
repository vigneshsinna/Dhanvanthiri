<?php

namespace App\Modules\OrderManagement\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\OrderManagement\Models\Order;
use App\Modules\OrderManagement\Models\Shipment;
use App\Modules\OrderManagement\Models\ShipmentEvent;
use App\Modules\OrderManagement\Services\OrderStateMachine;
use App\Modules\OrderManagement\Services\CustomerNotificationService;
use App\Modules\OrderManagement\Http\Requests\CreateShipmentRequest;
use App\Modules\OrderManagement\Http\Requests\AddShipmentEventRequest;
use Illuminate\Http\Request;

class AdminShipmentController
{
    public function store(CreateShipmentRequest $request, int $orderId)
    {
        $order = Order::findOrFail($orderId);
        $data = $request->validated();

        $shipment = $order->shipments()->create([
            'carrier' => $data['carrier'],
            'tracking_number' => $data['tracking_number'],
            'tracking_url' => $data['tracking_url'] ?? null,
            'status' => 'pending',
            'shipped_at' => now(),
            'estimated_delivery_at' => $data['estimated_delivery_at'] ?? null,
        ]);

        $sm = app(OrderStateMachine::class);
        if ($sm->canTransition($order->status, 'shipped')) {
            $sm->transition($order, 'shipped', 'Shipment created: ' . $data['tracking_number'], $request->user()->id);
        }

        // Notify customer about shipment
        app(CustomerNotificationService::class)->notify($order, 'shipment_dispatched', [
            'tracking_number' => $data['tracking_number'],
        ]);

        return ApiResponse::success(['data' => $shipment], 'Shipment created', 201);
    }

    public function update(Request $request, int $id)
    {
        $shipment = Shipment::findOrFail($id);

        $data = $request->validate([
            'carrier' => 'sometimes|string|max:100',
            'tracking_number' => 'sometimes|string|max:100|unique:shipments,tracking_number,' . $id,
            'tracking_url' => 'nullable|string',
            'status' => 'sometimes|in:pending,in_transit,out_for_delivery,delivered,failed,returned',
            'estimated_delivery_at' => 'nullable|date',
            'delivered_at' => 'nullable|date',
        ]);

        $shipment->update($data);

        if (isset($data['status']) && $data['status'] === 'delivered') {
            $shipment->delivered_at = $shipment->delivered_at ?? now();
            $shipment->save();

            $order = $shipment->order;
            $sm = app(OrderStateMachine::class);
            if ($sm->canTransition($order->status, 'delivered')) {
                $sm->transition($order, 'delivered', 'All shipments delivered', $request->user()->id);
                app(CustomerNotificationService::class)->notify($order, 'delivered');
            }
        }

        return ApiResponse::success(['data' => $shipment->fresh()], 'Shipment updated');
    }

    public function addEvent(AddShipmentEventRequest $request, int $id)
    {
        $shipment = Shipment::findOrFail($id);
        $data = $request->validated();

        $event = ShipmentEvent::create([
            'shipment_id' => $shipment->id,
            'status' => $data['status'],
            'location' => $data['location'] ?? null,
            'description' => $data['description'],
            'occurred_at' => $data['occurred_at'] ?? now(),
        ]);

        $shipment->status = $data['status'];
        $shipment->save();

        return ApiResponse::success(['data' => $event], 'Shipment event added', 201);
    }
}
