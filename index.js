/* eslint-disable no-unused-expressions */
/**
 * Load 'request-promise' package, to execute HTTP requests.
 * This package depends upon 'request' package.
 * @see: [documentation](https://github.com/request/request-promise)
 * @type {Object}
 */
const rp = require('request-promise');
/**
 * Load 'dotenv' package, to load env variables.
 */
require('dotenv').config();

/**
 * Custom error object with some string constants.
 */
const _errorMessages = {
  badRequest: 'Server replied with 400: bad request.',
  missingToken: 'Bearer token is missing',
  missingURL: 'Please provide the endpoint URL in a .env file or as a parameter.',
  unauthorized: 'Server replied with 401: unauthorized.',
  unknownError: 'A unknown error occurred.',
};
/**
 * Custom error object with some string constants for HTTP error codes.
 */
const _errorCodes = {
  badRequest: 400,
  unauthorized: 401,
  unknownError: 500,
};
// @see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
// @see: https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
class Auth0RetrieveUserError extends Error {
  constructor(statusCode, message, ...args) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...args);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Auth0RetrieveUserError);
    }

    // Custom debugging information
    this.statusCode = statusCode;
    this.message = message;
    this.date = new Date();
  }
}
/**
 * Contact Auth0 endpoint '/tokeninfo' using a HTTP POST request.
 * /tokeninfo endpoint has 3 different statusCode:
 *  - 200 OK: the request was successful: the body contains the user.
 *  - 400 BAD REQUEST: the request failed because it was malformed: probably the token is missing.
 *  - 401 UNAUTHORIZED: the token is invalid/the user associated with that token doesn't have enough permissions.
 * @param bearer: contains the token in the format Bearer <token> <-- Notice the space between Bearer and the actual token
 * @param url: your auth0 url, in this format 'username.region.auth0.com'. 'https' and '/tokeninfo' are automatically added.
 * @param debug: execute the function in debug mode: will print verbose debugging messages. (default value = false)
 * @returns {Promise<any>}
 */
const getTokenInfo = (bearer, url, debug = false) => new Promise(((resolve, reject) => {
  /**
   * Check if a token is present.
   */
  if (!bearer) {
    // Since token is a mandatory value, if it's not present reject using the bad request status code (400).
    reject(new Auth0RetrieveUserError(_errorCodes.badRequest, _errorMessages.missingToken));
    return;
  }
  /**
     * Check if the endpoint's URL is present as a parameters, or use the one in the environment variable.
   */
  let auth0Url;
  if (!url) {
    // Try to retrieve the URL from .env file loaded in the root of the application using this package.
    auth0Url = process.env.AUTH0_INFO;
    if (!auth0Url) {
      // Since token is a mandatory value, if it's not present reject using the bad request status code (400).
      reject(new Auth0RetrieveUserError(_errorCodes.badRequest, _errorMessages.missingURL));
      return;
    }
  } else {
    auth0Url = url;
  }
  /**
   * Bearer is in the format Bearer <token>
   * Try to parse the token, removing the 'Bearer' keyword, and saving the actual token value in the token variable.
   */
  let token;
  try {
    token = bearer.split(' ').pop();
  } catch (error) {
    // The parsing of the token failed, that means that the provided token was malformed and the request cannot be made.
    reject(new Auth0RetrieveUserError(_errorCodes.badRequest, error));
  }
  /**
   * Options for the HTTP request
   */
  auth0Url = `https://${auth0Url}/tokeninfo`;
  debug ? console.log(`Token: ${token}\n`) : false; // Print the token
  debug ? console.log(`Auth0 url: ${auth0Url}\n`) : false; // Print request URL
  const options = {
    method: 'POST',
    uri: auth0Url,
    form: {
      id_token: token,
    },
    resolveWithFullResponse: true, // Gets the full response of the server instead of just the body.
    simple: false, // The request will fail only for technical reasons.
    timeout: 5000, // Set the timeout of this request to 5s
  };
  rp(options).then((response) => {
    debug ? console.log(response) : false; // Print full response object: very very very long
    debug ? console.log(`Status code: ${response.statusCode}\n`) : false; // Print response statusCode
    debug ? console.log(`Response body: ${response.body}\n`) : false; // Print response body
    /**
     * Auth0 servers replies with status === 400 if the request is malformed.
     */
    if (response.statusCode === 400) {
      reject(new Auth0RetrieveUserError(_errorCodes.badRequest, _errorMessages.badRequest));
      return;
    }
    /**
     * Auth0 servers replies with status === 401 if the user associated with the token is unauthorized.
     */
    if (response.statusCode === 401) {
      reject(new Auth0RetrieveUserError(_errorCodes.unauthorized, _errorMessages.unauthorized));
      return;
    }
    /**
     * Auth0 servers replies with status === 200 if everything is ok.
     */
    if (response.statusCode === 200) {
      /**
       * Auth0 replies with a JSON, so parse it and resolve the promise.
       * @type {Object}
       */
      const retrievedUser = JSON.parse(response.body);
      resolve(retrievedUser);
    } else {
      // The server responded with a unknown status code.
      reject(new Auth0RetrieveUserError(500, _errorMessages.unknownError));
    }
  }).catch((error) => {
    reject(new Auth0RetrieveUserError(500, error));
  });
}));

module.exports = getTokenInfo;
