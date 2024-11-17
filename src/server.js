// region Express
const express = require('express')
const path = require('path')
const app = express()
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/views'));
const port = process.env.PORT || 3000
// endregion

// region dotenv
const dotenv = require('dotenv')
dotenv.config()
// endregion

// region MongoDB
const {initMongoDbConnection} = require("./db/mongodb");
initMongoDbConnection()
// endregion

// region Swagger
const swaggerAutogen = require('swagger-autogen')();
const doc = {
  info: {
    title: 'Project API',
  },
  host: `localhost:${port}`
};
const outputFile = './swagger.json';
swaggerAutogen(outputFile, ["./server.js"], doc).then();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve)
app.get('/api-docs', swaggerUi.setup(swaggerDocument));
// endregion


app.get('/', (req, res) => {
  res.status(200).render('index')
})

app.get('/createBook', (req, res) => {
  res.status(200).render('createBook')
})

app.get('/dashboard', (req, res) => {
  res.status(200).render('dashboard')
})

app.get('/deleteBook', (req, res) => {
  res.status(200).render('deleteBook')
})

app.get('/editBook', (req, res) => {
  res.status(200).render('editBook')
})

app.get('/login', (req, res) => {
  res.status(200).render('login')
})

app.get('/message', (req, res) => {
  res.status(200).render('message')
})

app.get('/searchBooks', (req, res) => {
  res.status(200).render('searchBooks')
})

app.get('/signup', (req, res) => {
  res.status(200).render('signup')
})

app.get('/*', (req, res) => {
  res.status(404).render('message', {
    message: `${req.path.substring(1)} - Unknown request!`
  });
})

app.post('/*', (req, res) => {
  res.status(404).render('message', {
    message: `${req.path.substring(1)} - Unknown request!`
  });
})

app.patch('/*', (req, res) => {
  res.status(404).render('message', {
    message: `${req.path.substring(1)} - Unknown request!`
  });
})

app.put('/*', (req, res) => {
  res.status(404).render('message', {
    message: `${req.path.substring(1)} - Unknown request!`
  });
})

app.delete('/*', (req, res) => {
  res.status(404).render('message', {
    message: `${req.path.substring(1)} - Unknown request!`
  });
})

app.options('/*', (req, res) => {
  res.status(404).render('message', {
    message: `${req.path.substring(1)} - Unknown request!`
  });
})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
  console.log(`Swagger-UI at http://localhost:${port}/api-docs`)
})
