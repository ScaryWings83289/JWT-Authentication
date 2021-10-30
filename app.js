const express = require('express');
const app = express();
const mongoose = require('mongoose');
const auth = require('./helpers/jwt.js');
const unless = require('express-unless');
const cors = require('cors');
const users = require('./controllers/User.js');

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// CORS options
//app.use((req, res, next) => {
//  //allow access from every, elminate CORS
//  res.setHeader('Access-Control-Allow-Origin', '*');
//  res.removeHeader('x-powered-by');
//  //set the allowed HTTP methods to be requested
//  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//  //headers clients can use in their requests
//  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//  res.setHeader('Access-Control-Allow-Credentials', true);
//  next();
//});
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200, // For legacy browser support
  methods: "GET, PUT, POST, DELETE"
}

app.use(cors(corsOptions));

// middleware for authenticating token submitted with requests
auth.authenticateToken.unless = unless;
app.use(auth.authenticateToken.unless({
  path: [
    { url: '/users/login', methods: ['POST'] },
    { url: '/users/register', methods: ['POST'] }
  ]
}));
app.use(express.json()); // middleware for parsing application/json
app.use('/users', users); // middleware for listening to routes


// MONGODB Configuration
const mongo_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/JWT-Auth";
mongoose
  .connect(mongo_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected!"))
  .catch(err => console.log(err));


const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});