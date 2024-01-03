import { saveOrder } from './saveOrder.js'

export function checkout(checkoutForm, cart) {
  const confirmCheckoutMsg =
    'Are you sure you want to confirm purchasing the items in the cart?'
  const cancelCheckoutMsg = 'You can go back and add more items or reset your cart'

  !confirm(confirmCheckoutMsg) ? alert(cancelCheckoutMsg) : saveOrder(checkoutForm, cart)
}
