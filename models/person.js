const mongoose = require('mongoose')

const url = process.env.URI

mongoose.connect(url)
  .then(_ => console.log('connected to MongoDB'))
  .catch(err => console.log(err))
  
const personSchema = new mongoose.Schema({
  name: String,
  number: Number
})

personSchema.set('toJSON', {
  transform: (_, returnedPerson) => {
    returnedPerson.id = returnedPerson._id.toString()
    delete returnedPerson._id
    delete returnedPerson.__v
  }
})

module.exports = mongoose.model('Person', personSchema)