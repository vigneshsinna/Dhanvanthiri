# Extensions (Separated from Core Workflow Contracts)

## Shipping / Fulfillment Integrations

- Contract: `backend/app/Modules/Extensions/Shipping/Contracts/CarrierAdapterInterface.php`
- Service scaffold: `backend/app/Modules/Extensions/Shipping/Services/ShippingExtensionService.php`
- Intended use: carrier label creation, external tracking sync, shipment status polling.

## Marketing / Growth Tooling

- Service scaffold: `backend/app/Modules/Extensions/Marketing/Services/MarketingAutomationService.php`
- Intended use: abandoned cart campaigns, newsletter consent sync, recovery flows.

These are additive modules and do not override required core workflow behavior.
