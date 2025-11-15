//stand alone scripts testing mongodb connections manually
const mongoose = require('mongoose')


if (process.argv.length <3) {
  console.log('give password as argument')
  process.exit(1)
}

//stores the password from command line argument
const password = process.argv[2]
const url = `mongodb+srv://Fabian:${password}@cluster0.esbajfd.mongodb.net/noteApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)


//blueprint that defines the structure of the documents in a collection
const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

//transform the returned object id property(mongoose object) to id(string) and remove _id and __v
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


//constructor function for creating and working with new documents in mongodb
// Note is the collection name in the database
module.exports =  mongoose.model('Note', noteSchema)

const note = new Note({
  content: 'HTML is easy',
  important: true,
})

//saves the note document to the database
note.save().then(() => {
  console.log('note saved!')
})

// retrieves all notes from the database and prints them to the console
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})