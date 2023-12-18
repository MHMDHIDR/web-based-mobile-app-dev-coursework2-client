const loadingPage = document.querySelector('#loading')

export default new Vue({
  el: '#app',
  data: {
    webappName: 'After School Booking',
    showCart: false,
    searchQuery: '',
    sortCriteria: 'subject',
    sortDescending: false,
    lessons: [],
    cart: [],
    name: '',
    phone: ''
  },
  methods: {
    // methods are not cached and are re-evaluated on every render
    addToCart: function (lesson) {
      if (lesson.spaces > 0) {
        // only when there are spaces available then add to cart
        lesson.spaces -= 1
        const existingLesson = this.cart.find(item => item._id === lesson._id)
        if (existingLesson) {
          // we'll check the lesson by it's id, we'll compare it to the cart using find method, if its there then we'll update the values
          existingLesson.bookedClasses += 1
          existingLesson.totalPrice += lesson.price
        } else {
          //if not then we'll creat a new object for it to the cart and  push it to the cart
          const cartLesson = Object.assign({}, lesson, {
            bookedClasses: 1,
            totalPrice: lesson.price
          })
          this.cart.push(cartLesson)
        }
      }
    },

    removeFromCart: function (lesson) {
      lesson.spaces += 1

      const index = this.cart.findIndex(item => item._id === lesson._id)
      if (index !== -1) {
        this.cart[index].bookedClasses -= 1
        this.cart[index].totalPrice -= lesson.price

        if (this.cart[index].bookedClasses === 0) {
          this.cart.splice(index, 1)
        }

        // Update the lessons array with the modified lesson
        const originalLessonIndex = this.lessons.findIndex(
          item => item._id === lesson._id
        )
        if (originalLessonIndex !== -1) {
          this.lessons[originalLessonIndex].spaces += 1
        }
      }
    },

    checkout: function () {
      const confirmCheckout = confirm(
        'Are you sure you want to confirm purchasing the items in the cart?'
      )
      if (!confirmCheckout) {
        alert('You can go back and add more items or reset your cart')
      } else {
        alert('Thank you for your purchase')
        this.resetCart()
      }
    },

    toggleShowCart: function () {
      this.showCart = !this.showCart
    },

    loadLessons: function () {
      const loadLessonsInterval = setInterval(() => {
        fetch('http://localhost:5000/lessons')
          .then(res => res.json())
          .then(lessons => {
            this.lessons = lessons
            clearInterval(loadLessonsInterval)
            loadingPage.remove()
          })
      }, 1000)
    },

    resetCart: function () {
      //just reseting the array to empty array will reset it
      this.cart = []
      this.loadLessons()
    },

    toggleSorting() {
      //if it was ascending then it will be descending and vice versa
      this.sortDescending = !this.sortDescending
    },

    sortBySubject() {
      //I'll make sorting by subject and call the toggleSorting method
      this.sortCriteria = 'subject'
      this.toggleSorting()
    },

    sortByLocation() {
      //I'll make sorting using location and call the toggleSorting method
      this.sortCriteria = 'location'
      this.toggleSorting()
    },

    sortByPrice() {
      //I'll make sorting using price and call the toggleSorting method
      this.sortCriteria = 'price'
      this.toggleSorting()
    },

    sortBySpaces() {
      //here will be sorting using spaces and call the toggleSorting method
      this.sortCriteria = 'spaces'
      this.toggleSorting()
    }
  },
  computed: {
    // computer properties are cached and only re-evaluated when the dependencies change [when the values of the variables change]
    filteredAndSortedLessons() {
      // filter the lessons by the search query
      const filteredLessons = this.lessons.filter(
        lesson =>
          /*
           * i'll take the lessons array and go through it using filter method,
           * if the lesson subject or location includes the search query then it will be returned
           */
          lesson.subject.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          lesson.location.toLowerCase().includes(this.searchQuery.toLowerCase())
      )

      //here we gonna use the sort method from javascript, so I will sort only the filtered lessons
      //using the selected sorting criteria like subject, location, price or spaces
      return filteredLessons.sort((a, b) => {
        const order = this.sortDescending ? -1 : 1
        const criteria = this.sortCriteria

        if (a[criteria] < b[criteria]) return -order
        if (a[criteria] > b[criteria]) return order
        return 0
      })
    },
    //simple method that will tell how many items were in the cart
    totalItemsInTheCart: function () {
      return this.cart.length
    },
    //I'll check if the name has more than 1 letter, and check if the phone number is valid (only numbers)
    isInputValid: function () {
      const name = this.name.trim()
      const isPhoneValid = this.phone.trim().length > 2 // has at least 3 numbers
      const isNameValid = /^[A-Za-z]+$/.test(name) && name.length > 1 //  only letters and has at least 2 letters [spaces are NOT allowed]
      return isPhoneValid && isNameValid
    },
    //I'll calculate the total price of my cart
    totalCartPrice: function () {
      return this.cart.reduce((total, item) => total + item.totalPrice, 0)
    }
  },
  // created is called only once when the component is created [when the page is loaded]
  created() {
    this.loadLessons()
  }
})
