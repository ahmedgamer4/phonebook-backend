require('dotenv').config()
const express = require('express')
const morgan = require('morgan')

const app = express()
const cors = require('cors')
const { response } = require('express')
const Person = require('./models/person')

const log = morgan((tokens, request, response) => [
  tokens.method(request, response),
  tokens.url(request, response),
  tokens.status(request, response),
  tokens.res(request, response, 'content-length'), '-',
  tokens['response-time'](request, response), `ms ${JSON.stringify(request.body)}`,
].join(' '))

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(log)

const persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
]

app.get('/', (request, response) => {
  response.send('<h1>Phone book backend</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then((people) => response.json(people))
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then((result) => response.json(result))
})

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
                ${new Date()}`)
})

app.delete('/api/persons/:id', (request, response, next) => {
  const { id } = request.params
  Person.findByIdAndRemove(id)
    .then((_) => {
      response.status(204).end()
    })
    .catch((err) => next(err))
})

app.post('/api/persons', (request, response, next) => {
  const { body } = request

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number is missing',
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then((result) => response.json(result))
    .catch((err) => next(err))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { id } = req.params
  const { body } = req

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(id, person, { new: true })
    .then((result) => {
      res.json(result)
    })
    .catch((err) => next(err))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (err, req, res, next) => {
  console.error(err.messsage)

  if (err === 'CaseError') {
    return res.status(400).send({ err: 'maltforamtted id' })
  }
  if (err === 'ValidationError') {
    return res.status(400).send({ err: err.message })
  }
  next(err)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
