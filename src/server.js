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
  // console.log("Inserted document:", results);
  return results;
}


const findDocument = async (db, criteria) => {
  var collection = db.collection(collectionName);
  let results = await collection.find(criteria).toArray();
  // console.log("Found the documents:", results);
  return results;
}


const updateDocument = async (db, criteria, updateData) => {
  var collection = db.collection(collectionName);
  let results = await collection.updateOne(criteria, {$set: updateData});
  // console.log("update one document:" + JSON.stringify(results));
  return results;
}

const deleteDocument = async (db, criteria, deleteData) => {
  var collection = db.collection(collectionName);
  let results = await collection.deleteOne(criteria, {$set: deleteData});
  // console.log("delete one document:" + JSON.stringify(results));
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
    res.render('message', {
      message: 'Book created successfully!',
      redirectUrl: '/dashboard'
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

app.get('/editBook', async (req, res) => {
  const {id} = req.query;
  await client.connect();
  const db = client.db("library");
  const book = await findDocument(db, {_id: new ObjectId(id)});
  res.status(200).render('editBook', {book: book[0]}); // Pass the book to the template
})

app.post('/editBook', async (req, res) => {
  const {id, title, author} = req.body;

  try {
    await client.connect();
    const db = client.db("library");
    await updateDocument(
      db,
      {_id: new ObjectId(id)},
      {
        title: title,
        author: author
      }
    );
    res.render('message', {
      message: 'Book edited successfully!',
      redirectUrl: '/searchBooks'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error edit book'
    });
  }
});

app.get('/deleteBook', async (req, res) => {
  const {id} = req.query;
  await client.connect();
  const db = client.db("library");
  const book = await findDocument(db, {_id: new ObjectId(id)});
  res.status(200).render('deleteBook', {book: book[0]});
})

app.post('/deleteBook', async (req, res) => {
  const {id, title, author} = req.body

  try {
    await client.connect();
    const db = client.db("library");
    const book = await deleteDocument(db, {_id: new ObjectId(id)});
    res.render('message', {
      message: 'Book deleted successfully!',
      redirectUrl: '/searchBooks'
    });
  } catch (error) {
    res.status(500).render('message', {
      message: 'Error delete book'
    });
  }
});


app.get('/login', (req, res) => {
  res.status(200).render('login')
})
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  // Check if the user was found
  if (!user) {
    return res.render("message", { message: 'Invalid username or password' ,
    redirectUrl: '/login'});
  }

  // Now it's safe to access user.password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (isPasswordValid) {
    req.session.username = user.username;
    return res.redirect('/dashboard');
  } else {
    return res.render("message", { message: 'Invalid username or password',
    redirectUrl: '/login' });
  }
});
app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
})

app.get('/signup', (req, res) => {
  res.status(200).render('signup')
})

app.post('/signup', async (req, res) => {
  let { username, password, confirm_password } = req.body;

  let exists = await User.find({ username }).exec();

  // Check if the user already exists
  if (exists.length > 0) {
    return res.render("message", {
      message: 'User already exists',
      redirectUrl: '/signup'
    });
  }

  // Check if passwords match
  if (password && confirm_password && confirm_password !== password) {
    return res.render("message", {
      message: 'Passwords do not match',
      redirectUrl: '/signup'
    });
  }

  // Hash the password and create a new user
  password = await bcrypt.hash(password, 10);
  const user = new User({ username, password });
  await user.save();

  // Redirect to login after successful signup
  return res.redirect('/login');
});

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
