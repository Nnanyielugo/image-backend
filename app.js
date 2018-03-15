const express = require('express');
const path = require('path');
const logger = require('morgan');
// const favicon = require('favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');

const isProduction = process.env.NODE_ENV === 'production';

require('./api/db');
require('./api/auth/passport');

const api = require('./api/routes/index');

const app = express();

app.use(cors());
app.use(logger('dev'));

// make image upload path publicly accessible
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/api', api);


// handle error, pass message, set statusCode, and pass error object to the next middleware function
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// catch 500 error and handle
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({

    error: {
      message: error.message
    }
  });
});

app.set('port', process.env.PORT || 5000);
const server = app.listen(app.get('port'), function(){
  console.log('Server started...\nListening on port: ' + server.address().port);
});