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

// Static files middleware
app.use(express.static(path.join(__dirname, '../src/public')));
// end Static files middleware

const bcrypt = require('bcrypt');

// region MongoDB
const {User} = require("./db/mongodb");
const {Book} = require("./db/mongodb");
const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb")
const
  client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
const collectionName = "books"
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
const bookSchema = require("./models/book");
app.use('/api-docs', swaggerUi.serve)
app.get('/api-docs', swaggerUi.setup(swaggerDocument));
// endregion
////////////////////////////////////////
const insertDocument = async (db, doc) => {
  var collection = db.collection(collectionName);
  let results = await collection.insertOne(Book);
  console.log("Inserted document:", results);
  return results;
}


const findDocument = async (db, criteria) => {
  var collection = db.collection(collectionName);
  let results = await collection.find(criteria).toArray();
  console.log("Found the documents:", results);
  return results;
}


const updateDocument = async (db, criteria, updateData) => {
  var collection = db.collection(collectionName);
  let results = await collection.updateOne(criteria, {$set: updateData});
  console.log("update one document:" + JSON.stringify(results));
  return results;
}

const deleteDocument = async (db, criteria) => {
  var collection = db.collection(collectionName);
  let results = await collection.deleteOne(criteria);
  console.log("delete one document:" + JSON.stringify(results));
  return results;
}

///////////////////////////////////////

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string
}

app.get('/', async (req, res) => {
  res.status(200).render('index')
})

app.get('/createBook', (req, res) => {
  res.status(200).render('createBook'); // Render the form, do not call handle_Create here
});

app.post('/createBook', async (req, res) => {
  const {title, author} = req.body;

  try {
    const newBook = new Book({
      title,
      author,
    });
    await newBook.validate();
    await newBook.save();
    res.status(201).render('message', {
      message: 'Book created successfully'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error creating book'
    });
  }
});

app.get('/searchBooks', async (req, res) => {
  await client.connect();
  const db = client.db("library");

  const books = await findDocument(db, {});
  res.status(200).render('searchBooks', {books});
});

app.post('/searchBooks', async (req, res) => {
  const {keyword} = req.body;

  try {
    const criteria = {};

    const or = []
    if (keyword) {
      const k = escapeRegExp(keyword);
      or.push([
        {title: {$regex: k, $options: 'i'}},
        {author: {$regex: k, $options: 'i'}},
      ]);
    }

    if (or.length > 1) {
      criteria.$and = or.map(o => {
        return {$or: o}
      })
    } else if (or.length === 1) {
      criteria.$or = or[0]
    }

    await client.connect();
    const db = client.db("library");


    const books = await findDocument(db, criteria);

    res.status(200).json({books});
  } catch (error) {
    console.error('Error searching for books:', error);
    res.status(500).render('message', {
      message: 'Error searching for books',
    });
  }
});


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
app.post('/login', async (req, res) => {
  const {username, password} = req.body;
  const user = await User.findOne({username});
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (user && isPasswordValid === true) {
    return res.redirect('/dashboard');
  } else {
    return res.render("message", {message: 'Invalid username or password'});
  }
});
app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
})
app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
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
