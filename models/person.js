const mongoose = require('mongoose')

const url = process.env.URI

mongoose.connect(url)
  .then((_) => console.log('connected to MongoDB'))
  .catch((err) => console.log(err))

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: Number,
    required: true,
    validate: {
      validator: (v) => /\d{3}-\d{3}-\d{4}/.test(v),
      message: (props) => `${props.value} is not a valid phone number`,
    },
  },
})

personSchema.set('toJSON', {
  transform: (_, returnedPerson) => {
    returnedPerson.id = returnedPerson._id.toString()
    delete returnedPerson._id
    delete returnedPerson.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
