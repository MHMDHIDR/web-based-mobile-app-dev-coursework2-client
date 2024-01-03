export function removeFromCart(lesson) {
  lesson.spaces += 1

  const index = this.cart.findIndex(item => item._id === lesson._id)
  if (index !== -1) {
    this.cart[index].bookedClasses -= 1
    this.cart[index].totalPrice -= lesson.price

    if (this.cart[index].bookedClasses === 0) {
      this.cart.splice(index, 1)
    }

    // Update the lessons array with the modified lesson
    const originalLessonIndex = this.fetchedLessons.findIndex(
      item => item._id === lesson._id
    )
    if (originalLessonIndex !== -1) {
      this.fetchedLessons[originalLessonIndex].spaces += 1
    }
  }
}
