export const mockScenarioNames = [
  'default',
  'slow',
  'api-error',
  'empty',
  'catalog-error',
  'detail-error',
  'variable-latency',
  'signup-conflict',
  'session-expired',
  'favorite-error',
  'cart-error',
  'cart-mutation-error',
  'quote-error',
  'cart-existing',
  'cart-existing-mutation-error',
  'checkout-price-changed',
  'checkout-availability-changed',
  'checkout-coupon-expired',
  'checkout-fee-changed',
  'wallet-rejected',
  'wallet-disconnected',
  'order-timeout-after-create',
  'order-pending',
  'order-rejected',
  'order-server-error',
  'profile-error',
  'profile-mutation-error',
  'avatar-error',
  'password-error',
  'wallet-error',
  'wallet-mutation-error',
] as const

export type MockScenario = (typeof mockScenarioNames)[number]

export function isMockScenario(value: unknown): value is MockScenario {
  return typeof value === 'string' && mockScenarioNames.some((scenario) => scenario === value)
}
