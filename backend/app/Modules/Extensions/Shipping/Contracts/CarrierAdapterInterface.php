<?php

namespace App\Modules\Extensions\Shipping\Contracts;

interface CarrierAdapterInterface
{
    public function createShipment(array $payload): array;

    public function generateLabel(string $shipmentReference): array;

    public function track(string $trackingNumber): array;
}
