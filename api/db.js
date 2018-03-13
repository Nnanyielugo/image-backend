const mongoose = require('mongoose');

const URI = require('../config/config').DB_URI;

mongoose.connect(URI);
mongoose.set('debug', true);

mongoose.connection.on('connected', function(){
  console.log('Mongoose connected to: ' + URI);
});

mongoose.connection.on('error', function(err){
  console.log('Connection error: ' + err);
});

mongoose.connection.on('disconnected', function(){
  console.log('Mongoose disconnected')
});

require('./models/');