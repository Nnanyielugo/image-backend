const jwt = require('express-jwt');
const secret = require('../../config/config').SECRET;

// decode jwt
function getTokenFromHeader(req){
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token' ||
      req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
      }
  
  return null;
}

const auth = {
  required: jwt({
    secret: secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: secret,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getTokenFromHeader
  })
}

module.exports = auth;

// The getTokenFromHeader() function is a helper function that both middlewares use to extract the JWT from the Authorization header. 
// The only difference between the required and optional middlewares is that the,
//  optional middleware is configured with credentialsRequired: false so that requests without a token will still succeed. 
// userProperty is the property where the JWT payloads will be attached to each request, so we can access the data using req.payload.