import type { Checkout } from './types'

// Minimal typing for the slice of Razorpay Checkout we use.
interface RazorpayHandlerResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description: string
  handler: (response: RazorpayHandlerResponse) => void
  modal?: { ondismiss?: () => void }
  theme?: { color?: string }
}

interface RazorpayInstance {
  open: () => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance
  }
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

let loader: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  if (loader) return loader
  loader = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.onload = () => resolve()
    script.onerror = () => {
      loader = null
      reject(new Error('Could not load the payment window.'))
    }
    document.body.appendChild(script)
  })
  return loader
}

/** Thrown when the user closes the checkout without paying. */
export class CheckoutDismissed extends Error {
  constructor() {
    super('Checkout dismissed')
    this.name = 'CheckoutDismissed'
  }
}

/**
 * Opens the Razorpay checkout modal. Resolves once the payment is submitted
 * successfully; rejects with {@link CheckoutDismissed} if the user closes it.
 * Permanence is granted server-side by the webhook, not by this resolution.
 */
export async function openCheckout(
  checkout: Checkout,
  opts: { name: string; description: string },
): Promise<void> {
  await loadScript()
  const Razorpay = window.Razorpay
  if (!Razorpay) throw new Error('The payment window is unavailable.')

  return new Promise<void>((resolve, reject) => {
    const rzp = new Razorpay({
      key: checkout.keyId,
      amount: checkout.amount,
      currency: checkout.currency,
      order_id: checkout.orderId,
      name: opts.name,
      description: opts.description,
      handler: () => resolve(),
      modal: { ondismiss: () => reject(new CheckoutDismissed()) },
      theme: { color: '#e4b23f' },
    })
    rzp.open()
  })
}
