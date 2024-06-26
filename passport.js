/*  PASSPORT SETUP  */
const express=require('express')
app=express()

const passport = require('passport');


app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, cb) {
    cb(null, user);
  });
  
  passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
  });

module.exports=passport