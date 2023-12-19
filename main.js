const loadingPage = document.querySelector('#loading')

export default new Vue({
  el: '#app',
  data: {
    webappName: 'After School Booking',
    showCart: false,
    searchQuery: '',
    sortCriteria: 'subject',
    sortDescending: false,
    fetchedLessons: [],
    initialLessons: [],
    cart: [],
    checkoutForm: {
      name: '',
      phone: ''
    },
    searchDelay: 1000,
    lastSearchQuery: ''
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
        const originalLessonIndex = this.fetchedLessons.findIndex(
          item => item._id === lesson._id
        )
        if (originalLessonIndex !== -1) {
          this.fetchedLessons[originalLessonIndex].spaces += 1
        }
      }
    },

    checkout: function () {
      const confirmCheckoutMsg =
        'Are you sure you want to confirm purchasing the items in the cart?'
      const cancelCheckoutMsg = 'You can go back and add more items or reset your cart'

      !confirm(confirmCheckoutMsg)
        ? alert(cancelCheckoutMsg)
        : this.saveOrder(this.checkoutForm, this.cart)
    },

    saveOrder: function (form, cart) {
      alert('Thank you for your purchase')

      // Fetch POST to save the order
      fetch('http://localhost:5000/orders', {
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
        .then(_data => this.updateLessonsSpaces())
        // if there was an error then I'll alert the user
        .catch(err => alert(err))
    },

    updateLessonsSpaces: function () {
      fetch('http://localhost:5000/lessons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderedLessons: this.cart.map(({ _id, bookedClasses }) => ({
            _id,
            spaces: bookedClasses
          }))
        })
      })
        .then(res => res.json())
        .then(_data => this.resetCart())
        // if there was an error then I'll alert the user
        .catch(err => alert(err))
    },

    toggleShowCart: function () {
      this.showCart = !this.showCart
    },

    /*
     *  Loading the lesson from the server after 1 second
     *  to simulate the loading time, and show the loading page
     */
    loadLessons: function () {
      const loadLessonsInterval = setInterval(() => {
        fetch('http://localhost:5000/lessons')
          .then(res => res.json())
          .then(lessons => {
            this.initialLessons = lessons.slice()
            this.fetchedLessons = lessons
          })
          .catch(error => alert(error))
          .finally(() => {
            //loadingPage.remove()
            clearInterval(loadLessonsInterval)
          })
      }, 4000)
    },

    resetCart: function () {
      //just reseting the array to empty array will reset it
      this.cart = []
      this.loadLessons()
    },

    toggleSorting: function () {
      //if it was ascending then it will be descending and vice versa
      this.sortDescending = !this.sortDescending
    },

    sortBySubject: function () {
      //I'll make sorting by subject and call the toggleSorting method
      this.sortCriteria = 'subject'
      this.toggleSorting()
    },

    sortByLocation: function () {
      //I'll make sorting using location and call the toggleSorting method
      this.sortCriteria = 'location'
      this.toggleSorting()
    },

    sortByPrice: function () {
      //I'll make sorting using price and call the toggleSorting method
      this.sortCriteria = 'price'
      this.toggleSorting()
    },

    sortBySpaces: function () {
      //here will be sorting using spaces and call the toggleSorting method
      this.sortCriteria = 'spaces'
      this.toggleSorting()
    },

    /**
     * Debounce method used to delay the fetch request
     * the fetch request will be called after the
     * user stops typing for 1 second
     * @param {*} func
     * @param {*} delay
     * @returns {Function}
     */
    debounce: function (func, delay) {
      let timeoutId
      return function () {
        const context = this
        const args = arguments
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          func.apply(context, args)
        }, delay)
      }
    }
  },
  computed: {
    filteredLessons: function () {
      const searchQuery = this.searchQuery.trim().toLowerCase()

      // Use debounce to delay the fetch request
      const delayedFetch = this.debounce(() => {
        if (searchQuery !== this.lastSearchQuery) {
          // Using the last searchQuery if the user types too fast searchQuery hasn't changed
          this.lastSearchQuery = searchQuery
          if (searchQuery !== '') {
            fetch(`http://localhost:5000/search?query=${encodeURIComponent(searchQuery)}`)
              .then(res => res.json())
              .then(lessons => {
                this.fetchedLessons = lessons
              })
              .catch(error => {
                console.error('Error fetching search results:', error)
              })
          } else {
            this.fetchedLessons = this.initialLessons
          }
        }
      }, this.searchDelay)

      /**
       *  Call the delayedFetch to make the fetch request when the user stops typing
       * to avoid making too many requests
       */
      delayedFetch()

      // Return the filtered lessons based on the searchQuery
      return (
        this.fetchedLessons
          .filter(
            lesson =>
              lesson.subject.toLowerCase().includes(searchQuery) ||
              lesson.location.toLowerCase().includes(searchQuery) ||
              String(lesson.price).includes(searchQuery) ||
              String(lesson.spaces).includes(searchQuery)
          )
          // sorting by the criteria and the order
          .sort((a, b) => {
            const order = this.sortDescending ? -1 : 1
            const criteria = this.sortCriteria

            if (a[criteria] < b[criteria]) return -order
            if (a[criteria] > b[criteria]) return order
            return 0
          })
      )
    },
    //simple method that will count the items I have in the cart
    totalItemsInTheCart: function () {
      return this.cart.length
    },
    //I'll check if the name has more than 1 letter, and check if the phone number is valid (only numbers)
    isInputValid: function () {
      const { name, phone } = this.checkoutForm
      const isPhoneValid = phone.trim().length > 2 // has at least 3 numbers
      const isNameValid = /^[A-Za-z]+$/.test(name.trim()) && name.trim().length > 1 //  only letters and has at least 2 letters [spaces are NOT allowed]
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
