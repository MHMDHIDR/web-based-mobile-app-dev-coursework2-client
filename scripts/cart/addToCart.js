export function addToCart(lesson) {
  if (lesson.spaces > 0) {
    /*
     * only when there are spaces available then add to cart
     * and update the spaces in the lesson
     * Also update the initialLessons[] for that specific lesson
     */
    lesson.spaces -= 1
    const existingLesson = this.cart.find(item => item._id === lesson._id)

    if (existingLesson) {
      /*
       * we'll check the lesson by it's id, we'll compare it to the cart using find method,
       * if its there then we'll update the values
       */
      existingLesson.bookedClasses += 1
      existingLesson.totalPrice += lesson.price
    } else {
      //if not then we'll creat a new object for it to the cart and push it to the cart
      const cartLesson = Object.assign({}, lesson, {
        bookedClasses: 1,
        totalPrice: lesson.price
      })
      this.cart.push(cartLesson)
    }

    /*
     * Update initialLessons array with the new  bookedClasses
     * so that the user can see the updated spaces in the lessons list (Landing page)
     */
    const initialLessonIndex = this.initialLessons.findIndex(
      item => item._id === lesson._id
    )
    if (initialLessonIndex !== -1) {
      this.initialLessons[initialLessonIndex].spaces = lesson.spaces
    }
  }
}
