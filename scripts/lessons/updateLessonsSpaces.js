export function updateLessonsSpaces(cart) {
  fetch('http://localhost:5000/lessons', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderedLessons: cart.map(({ _id, bookedClasses }) => ({
        _id,
        spaces: bookedClasses
      }))
    })
  })
    .then(res => res.json())
    .then(_data => alert('Thank you for your purchase ✅'))
    // if there was an error then I'll alert the user
    .catch(err => {
      alert(err)
      console.error(err)
      return new Error('Error updating lessons spaces: ' + err.message)
    })
}
