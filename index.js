//import node built-in web server module
const express = require('express');
const app = express();
// Serve static frontend build
app.use(express.static('dist'));
app.use(express.json());
// parse application/x-www-form-urlencoded (forms)
app.use(express.urlencoded({ extended: true }));
const cors = require('cors');
app.use(cors());

let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

// const app = http.createServer((request, response) =>{
//     response.writeHead(200, {'Content-Type': 'application/json'});
//     response.end(JSON.stringify(notes));
// })

app.get('/api/notes', (request, response) => {
    response.json(notes);
})
app.get('/api/notes/:id', (request, response) => {
console.log(request.params);
const id = request.params.id
const note = notes.find(note => note.id === id)
if(note){
    response.json(note)
}
else{
    //overwrite default 200 status code with 404 not found
    response.status(404).json({error: 'Note not found'}).end()
}
} )

app.delete('/api/notes/:id', (request, response) => {
    const id = request.params.id
    notes = notes.filter(note => note.id !== id)
    response.status(204).end()
})

//generate new id number for new note 
const generateId = () => {
  // use the current maximum numeric id and add 1 to avoid collisions
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => Number(n.id)))
    : 0;
  return String(maxId + 1);
}


app.post('/api/notes', (request, response) => {

  const body = request.body;
  // Helpful debug logs to diagnose clients that send no JSON or wrong content-type
  console.log('POST /api/notes headers:', request.headers);
  console.log('POST /api/notes raw body:', body);

    if(!body.content){
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note  = {
        content: body.content,
        important: body.important || false,
        id: generateId()
    }
    notes = notes.concat(note)
    response.json(note)
  })


const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`);