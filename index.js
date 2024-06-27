/*  EXPRESS */

const express = require('express');
const app = express();
require("dotenv").config()
const passport=require('./passport')
const googleAuth=require('./googleAuth')
// require('./openAi')
const session = require('express-session');
app.use(express.json())
let userProfile,at;


app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

app.get('/', function(req, res) {
  res.render('index');
});



app.set('view engine', 'ejs');

app.get('/success', (req, res) => res.render('success',userProfile));
app.get('/error', (req, res) => res.send("error logging in"));





/*  Google AUTH  */
app.use('/auth',googleAuth)


const port = process.env.PORT || 3000;
app.listen(port , () => console.log('App listening on port ' + port));