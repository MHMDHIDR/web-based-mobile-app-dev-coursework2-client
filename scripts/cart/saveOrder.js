import { updateLessonsSpaces } from '../lessons/updateLessonsSpaces.js'
import { resetCart } from '../cart/resetCart.js'

export function saveOrder(form, cart) {
  // Fetch POST to save the order
  fetch(`https://cst3145-lessons-booking-system.eu-west-2.elasticbeanstalk.com/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...form,
      orderedLessons: cart.map(({ _id, bookedClasses }) => ({
        _id,
        spaces: bookedClasses
      }))
    })
  })
    .then(res => res.json())
    /*
     * if successful saved the order
     * Them I'll use orderedLessons to update the lessons spaces
     */
    .then(_data => updateLessonsSpaces(cart))
    // if there was an error then I'll alert the user
    .catch(err => {
      console.error(err)
      return new Error('Error saving order: ' + err.message)
    })
    .finally(() => {
      resetCart(cart, null, true)
      // reset the form fields
      form.name = ''
      form.phone = ''
    })
}
