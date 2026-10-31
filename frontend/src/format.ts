// Formats a price given in the smallest currency unit (e.g. paise) as a currency
// string, e.g. { amount: 4900, currency: 'INR' } -> "₹49". Whole amounts drop the
// decimals; fractional ones keep them (e.g. 4999 -> "₹49.99").
export function formatPrice(amount: number, currency: string): string {
  const major = amount / 100
  const fractionDigits = amount % 100 === 0 ? 0 : 2
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(major)
  } catch {
    // Unknown currency code — fall back to a plain number with the code.
    return `${major} ${currency}`
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return ''
  seconds = Math.floor(seconds)
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}
