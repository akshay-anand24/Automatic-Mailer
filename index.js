/*  EXPRESS */

const express = require('express');
const app = express();
require("dotenv").config()
const session = require('express-session');
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

const port = process.env.PORT || 3000;
app.listen(port , () => console.log('App listening on port ' + port));


/*  PASSPORT SETUP  */

const passport = require('passport');


app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.get('/success', (req, res) => res.render('success',userProfile));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});



/*  Google AUTH  */


const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    scope : ['profile', 'email','https://www.googleapis.com/auth/gmail.readonly'] 
    },
  function(accessToken, refreshToken, profile, done) {

    profile.accessToken=accessToken
      return done(null, profile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google'));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  async function(req, res) {
    // Successful authentication, redirect success.
    try {
        userProfile=req.user
        const emails = await readEmails(req.user.accessToken); // Replace with actual email reading function
        const emailContent = await readEmailContent(req.user.accessToken, emails[0].id)
        res.send(emailContent); // Pass retrieved emails to template (optional)
      } catch (err) {
        console.error('Error reading emails:', err);
        res.send('/error');
      }
  });




// Function to read emails using Gmail API (replace with actual implementation)
const { google } = require('googleapis');

async function readEmails(accessToken) {
  
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      "http://localhost:3000/auth/google/callback" // Redirect URI (replace if needed)
    );
    oauth2Client.setCredentials({ access_token: accessToken });
  
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
    // Example: Retrieve a list of emails (replace with specific data fetching logic)
    try {
      const res = await gmail.users.messages.list({
        userId: 'me',
        labelIds: ['INBOX'] // Filter by label (optional)
      });
      return res.data.messages; // Replace with specific data you need (e.g., message details)
    } catch (err) {
      throw err;
    }
  }


  // Function to read specific email content
async function readEmailContent(accessToken, emailId) {
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      "http://localhost:3000/auth/google/callback" // Redirect URI (replace if needed)
    );
    oauth2Client.setCredentials({ access_token: accessToken });
  
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
    try {
      const res = await gmail.users.messages.get({
        userId: 'me',
        id: emailId
      });
      const payload = res.data.payload;
    //   return payload

      // Check for plain text content (modify for HTML handling)
      if(payload.body.data){
        const decodedData = Buffer.from(payload.body.data, 'base64').toString('utf-8');
        return decodedData;
      }
      else if (payload.parts[0].body.data ) {
        const decodedData = Buffer.from(payload.parts[1].body.data, 'base64').toString('utf-8');
        return decodedData;
      } 
      else if (payload.parts[0].parts[1].body.data ) {
        const decodedData = Buffer.from(payload.parts[0].parts[1].body.data, 'base64').toString('utf-8');
        return decodedData;
      } 
      
      else {
        console.warn('Email content format not supported (text/plain expected)');
        return 'Email content format not supported'; // Or handle unsupported formats differently
      }
    }catch (err) {
      throw err;
    }
  }
  