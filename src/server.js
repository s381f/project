// region dotenv
const dotenv = require('dotenv')
dotenv.config()
// endregion

// region Express
const express = require('express')
const expressSession = require('express-session')
const path = require('path')
const app = express()
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/views'));
app.use(expressSession({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {secure: true}
}))
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// in latest body-parser use like below.
app.use(bodyParser.urlencoded({extended: true}));
const port = process.env.PORT || 3000
// endregion

//Static Files in Express
app.use(express.static('public'));

const bcrypt = require('bcrypt');

// region MongoDB
const {User} = require("./db/mongodb");
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
const userSchema = require("./models/user");
app.use('/api-docs', swaggerUi.serve)
app.get('/api-docs', swaggerUi.setup(swaggerDocument));
// endregion


app.get('/', async (req, res) => {
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
app.post('/login',async(req,res) => {
  const{username, password} = req.body;
  const user = await User.findOne({username});
  const isPasswordvalid =await bcrypt.compare(password, user.password);
  if(user && isPasswordvalid == true){
    return res.redirect('/dashboard');
  }else{
    return res.render("message",{message: 'Invalid username or password'});
  }
})
app.get('/logout', (req,res) =>{
  req.session = null;
  res.redirect('/login');
})
app.get('/searchBooks', (req, res) => {
  res.status(200).render('searchBooks')
})

app.get('/signup', (req, res) => {
  res.status(200).render('signup')
})

app.post('/signup', async (req, res) => {
  let {username, password, confirm_password} = req.body;

  let exists = await User.find({
    username: username,
  }).exec()

  if (exists.length > 0) {
    res.render("message", {
      message: 'User already exists'
    })
  }

  if (password && confirm_password && confirm_password !== password) {
    res.render("message", {
      message: 'Passwords do not match'
    })
  }

  password = await bcrypt.hashSync(password, 10)

  const user = new User({username, password})
  await user.save()

  return res.redirect('/')
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
