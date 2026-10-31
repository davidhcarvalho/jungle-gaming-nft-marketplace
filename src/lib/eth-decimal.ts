const unitsPerEth = 10n ** 18n

export function ethToWei(value: string): bigint {
  const match = /^(\d+)(?:\.(\d{1,18}))?$/.exec(value)
  if (!match) throw new Error(`Valor ETH decimal inválido: ${value}`)
  const whole = BigInt(match[1]!)
  const fraction = BigInt((match[2] ?? '').padEnd(18, '0') || '0')
  return whole * unitsPerEth + fraction
}

export function weiToEth(value: bigint): string {
  const sign = value < 0n ? '-' : ''
  const absolute = value < 0n ? -value : value
  const whole = absolute / unitsPerEth
  const fraction = (absolute % unitsPerEth).toString().padStart(18, '0').replace(/0+$/, '')
  return `${sign}${whole}${fraction ? `.${fraction}` : ''}`
}

export function multiplyEth(value: string, quantity: number): bigint {
  if (!Number.isSafeInteger(quantity) || quantity < 0) throw new Error('Quantidade inválida para cálculo ETH.')
  return ethToWei(value) * BigInt(quantity)
}

export function percentageOfWei(value: bigint, percentage: number): bigint {
  if (!Number.isSafeInteger(percentage) || percentage < 0 || percentage > 100) {
    throw new Error('Percentual inválido para cálculo ETH.')
  }
  return (value * BigInt(percentage)) / 100n
}
