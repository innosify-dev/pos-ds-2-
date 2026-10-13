/**
 * Integrated card-terminal contract. This frontend has no provider client.
 * Do not mark a sale paid from this module. The backend must own secrets,
 * terminal pairing, and webhook verification.
 *
 * Expected backend surface, once a provider is chosen:
 * - POST /payments/terminal/initiate  { saleIntentId, amountPaise, currency, branchId, registerId, terminalId }
 * - GET  /payments/:paymentId         pending | succeeded | declined | cancelled | timed_out
 * - POST /payments/webhooks/:provider raw body plus signature header, verified server-side
 * - Idempotency-Key on initiate so a retry cannot charge twice
 * - Reconcile paymentId to saleId only after succeeded
 * - Refunds use the provider refund API with the original paymentId
 * Merchant onboarding, terminal pairing, and provider credentials stay on the server.
 */

export const terminalIntegration = {
  connected: false,
  mode: 'unavailable',
};
