/*  Google AUTH  */
const express = require('express');
Router=express.Router()
const passport=require('./passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const {readEmails,readEmailContent}=require('./googleApiHandlers')
const run=require('./openAi')


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
 
Router.get('/google', 
  passport.authenticate('google'));
 
Router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  async function(req, res) {
    // Successful authentication, redirect success.
    try {
        userProfile=req.user
        const emails = await readEmails(req.user.accessToken); // Replace with actual email reading function
        const emailContent = await readEmailContent(req.user.accessToken, emails[0].id)
        const reply=await run("just mark this email for me in three categories 1.Interested 2.Not Interested just reply with one word"
        +emailContent)
        res.send(emailContent); // Pass retrieved emails to template (optional)
      } 
      catch (err) {
        console.error('Error reading emails:', err);
        res.send('/errorss');
      }
  });

  module.exports=Router;