//import node built-in web server module
const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())
//serve the frontend build
app.use(express.static('dist'))
app.use(express.json())
require('dotenv').config()
const Note = require('./models/note')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('Params:  ', request.params)
  console.log('---')
  next()
}
app.use(requestLogger)

const password = process.argv[2]
console.log('password:', password)

app.get('/api/notes', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
})

//fetch a single note by id
app.get('/api/notes/:id', (request, response, next) => {
  console.log(request.params)
  const id = request.params.id
  Note.findById(id)
    .then((note) => {
      if (note) {
        response.json(note)
      } else {
        //overwrite default 200 status code with 404 not found
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

//updating a note using its id
app.put('/api/notes/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body

  const { content, important } = body
  Note.findById(id)
    .then((note) => {
      if (!note) {
        return response.status(404).end()
      }

      note.content = content
      note.important = important
      return note.save().then((updatedNote) => {
        response.json(updatedNote)
      })
    })
    .catch((error) => next(error))
})

//deleting a note using its id
app.delete('/api/notes/:id', (request, response, next) => {
  const id = request.params.id
  Note.findByIdAndDelete(id)
    .then((result) => {
      console.log(result)
      response.status(204).end()
    })
    .catch((error) => next(error))
})

// //generate new id number for new note
// const generateId = () => {
// const maxId = notes.length > 0
// ? Math.floor(Math.random() * 1000000)
// : 0
// return String(maxId + 1)
// }

app.post('/api/notes', (request, response, next) => {
  const body = request.body
  console.log(body)

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing',
    })
  }

  //create a new note object with mongoose model
  const note = new Note({
    content: body.content,
    important: body.important || false,
    // id: generateId(),
  })

  note
    .save()
    .then((savedNote) => {
      response.json(savedNote)
    })
    .catch((error) => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  // handle invalid id error
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  // handle validation error
  else if (error.name === 'validationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
