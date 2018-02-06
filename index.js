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
const _errors = {
  badRequest: 'Server replied with 400: bad request.',
  missingToken: 'Bearer token is missing',
  missingURL: 'Please provide the endpoint URL in a .env file or as a parameter.',
  unauthorized: 'Server replied with 401: unauthorized.',
  unknownError: 'A unknown error occurred.',
};
/**
 * Contact Auth0 endpoint '/tokeninfo' using a HTTP POST request.
 * /tokeninfo endpoint has 3 different statusCode:
 *  - 200 OK: the request was successful: the body contains the user.
 *  - 400 BAD REQUEST: the request failed because it was malformed: probably the token is missing.
 *  - 401 UNAUTHORIZED: the token is invalid/the user associated with that token doesn't have enough permissions.
 * @param bearer: contains the token in the format Bearer <token> <-- Notice the space between Bearer and the actual token
 * @param url: your auth0 url, in this format 'username.region.auth0.com'. 'https' and '/tokeninfo' are automatically added.
 * @param debug: execute the function in debug mode: will print verbose debugging messages. (default value = false)
 * @returns {Promise<>}
 */
// @todo: implement debug mode, writing to console verbose messages.
const getTokenInfo = (bearer, url, debug = false) => new Promise(((resolve, reject) => {
  /**
   * Check if a token is present.
   */
  if (!bearer) {
    reject(new Error(_errors.missingToken));
    return;
  }
  /**
     * Check if the endpoint's URL is present as a parameters, or use the one in the environment variable.
   */
  let auth0Url;
  if (!url) {
    auth0Url = process.env.AUTH0_INFO;
    if (!auth0Url) {
      reject(new Error(_errors.missingURL));
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
    reject(new Error(error));
  }
  /**
   * Options for the HTTP request
   */
  auth0Url = `https://${auth0Url}/tokeninfo`;
  console.log(auth0Url);
  const options = {
    method: 'POST',
    uri: auth0Url,
    form: {
      id_token: token,
    },
    resolveWithFullResponse: true, // Gets the full response of the server instead of just the body.
    // simple: false, // The request will fail only for technical reasons.
  };
  rp(options).then((response) => {
    console.log(response.statusCode);
    console.log(response.body);
    /**
     * Auth0 servers replies with status === 400 if the request is malformed.
     */
    if (response.statusCode === 400) {
      reject(_errors.badRequest);
      return;
    }
    /**
     * Auth0 servers replies with status === 401 if the user associated with the token is unauthorized.
     */
    if (response.statusCode === 401) {
      reject(_errors.unauthorized);
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
      reject(new Error(_errors.unknownError));
    }
  }).catch((error) => {
    reject(new Error(error));
  });
}));

module.exports = getTokenInfo;
