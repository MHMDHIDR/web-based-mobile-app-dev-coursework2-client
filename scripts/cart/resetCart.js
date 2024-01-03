/**
 * Reset the cart to its initial state
 * @param {Array} cart - The cart array
 * @param {Function} loadLessons - The loadLessons function
 */
export function resetCart(cart, loadLessons, fromCheckout = false) {
  // empty the cart
  cart.splice(0, cart.length)

  !fromCheckout && loadLessons()

  console.log('Cart reset successfully  ✅')
}
