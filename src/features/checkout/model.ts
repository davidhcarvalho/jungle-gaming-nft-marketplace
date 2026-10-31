import type { CreateOrderPayload } from '@/types/api'
const attemptKey = 'kurio:checkout-attempt'
export function getOrCreateAttemptKey() { const existing = sessionStorage.getItem(attemptKey); if (existing) return existing; const key = crypto.randomUUID(); sessionStorage.setItem(attemptKey, key); return key }
export function finishAttempt() { sessionStorage.removeItem(attemptKey) }
export function readAttemptKey() { return sessionStorage.getItem(attemptKey) }
export function makeOrderPayload(input: CreateOrderPayload): CreateOrderPayload { return input }
