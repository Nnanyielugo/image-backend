const express = require('express');
const path = require('path');
const logger = require('morgan');
// const favicon = require('favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

require('./api/db');

const api = require('./api/routes/index');

const app = express();

app.use(cors());
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/api', api);

app.set('port', process.env.PORT || 5000);
const server = app.listen(app.get('port'), function(){
  console.log('Server started...\nListening on port: ' + server.address().port);
});