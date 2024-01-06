require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
//importing data
const data = require('./data/feedbackdata.js');
const personaldata = require('./data/personaldata.js');
const professionaldata = require('./data/professionaldata.js');
const faculty = require('./data/faculty.js');

const app = express();
const port = process.env.PORT || 8080;

let tempLogin = false;

mongoose.connect(process.env.MONGODB_URL);

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

function addDate() {
  var currentDate = new Date();
  var options = {
    weekday: 'long', 
    month: 'short',
    day: 'numeric',  
    year: 'numeric'
  };
  var formattedDate = currentDate.toLocaleString('en-US', options);
  return formattedDate;
}

const blogSchema = new mongoose.Schema({
  heading: String,
  description: String,
  createdOn: {
    type: String,
    default: addDate
  }
}); 

const Blog = mongoose.model('Blog', blogSchema);



app.get('/', (req, res) => {
  res.render('home/homepage',  {data,  isAuthenticated: req.session.authenticated });
});

app.get('/personal', (req, res) => {
  res.render('personal/personal',  {personaldata,  isAuthenticated: req.session.authenticated });
});

app.get('/professional', (req, res) => {
  res.render('professional/professional',  {professionaldata,  isAuthenticated: req.session.authenticated });
});

app.get('/media', (req, res) => {
  res.render('media/media',  { isAuthenticated: req.session.authenticated });
});

app.get('/about', (req, res) => {
  res.render('about/about',  { faculty, isAuthenticated: req.session.authenticated });
});

app.get('/blog', async (req, res) => {
  const blogs = await Blog.find();
  res.render('blog/home', { blogs, isAuthenticated: req.session.authenticated });
});

app.get('/blog/blogs/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.render('blog/blog', { blog, isAuthenticated: req.session.authenticated });
});

app.get('/blog/login', (req, res) => {
  res.render('blog/login', { isAuthenticated: req.session.authenticated });
});

app.post('/blog/login', (req, res) => {
  const { username, password } = req.body;
  const storedUsername = process.env.USER_NAME;
  const storedPassword = process.env.PASSWORD;

  if (storedUsername === username && storedPassword === password) {
    // ---------
    function setTemporaryVariable() {
      // logging in
      tempLogin = true;
      setTimeout(() => {
        tempLogin = false;
      }, 3600000);
    }
    setTemporaryVariable();
    // -------------
    req.session.authenticated = true;
    // console.log(LoggedIn);
    res.redirect('/blog/create');
  } else {
    res.redirect('/blog/login');
  }
});

app.post('/blog/delete', async(req, res) => {
  const { blogId } = req.body;
  try {
    await Blog.findByIdAndDelete(blogId);
    res.redirect('/blog/delete'); // Redirect to the blog list page
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/blog/delete', async (req, res) => {
  const blogs = await Blog.find();
  if(tempLogin) {
    res.render('blog/allBlogs', {blogs});
  }
  else {
    res.end("Please Login before DELETING a blog");
  }
});


app.get('/blog/create', (req, res) => {
  // if (req.session.authenticated) {
  if (tempLogin) {
    req.session.authenticated = false;
    res.render('blog/create', { isAuthenticated: req.session.authenticated });
  } else {
    res.end("Please Login before CREATING a blog");
  }
});

app.post('/blog/create', async (req, res) => {
  const { heading, description } = req.body;

  try {
    const newBlog = new Blog({ heading, description });
    await newBlog.save();
    res.redirect('/blog/delete');
  } catch (error) {
    console.error(error);
    res.redirect('/blog/create');
  }
});

app.post('/', (req, res) => {
  // logging out
  tempLogin = false;
  res.redirect('/');
})

app.listen(port, () => {
  console.log(`Server started on PORT: ${port}`);
});
