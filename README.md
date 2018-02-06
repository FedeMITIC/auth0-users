# Auth0-users

# Purpose of this package
Auht0-users is a simple package used to query the `/tokeninfo` endpoint provided by Auth0 services.
This endpoint contains all the data of the user associated with the token/jwt sent.
The data returned from the server cannot be customized using this package, but must be edited using the Auth0 dashboard.

# Usage
First, load the package in your code:

`const getTokenInfo = require('auth0-retrieve-users');`

Then, call the function getTokenInfo to retrieve the data

`getTokenInfo(token, endpointUrl);`

`getTokenInfo` always returns a promise, so chain it with `.then()` and `.catch()`
methods to handle promise resolution and rejection.

This package can also be used as a middleware to retrieve the user data when he/she's
querying one of your API endpoint. See the example commented code below:

```
const getUser = (req, res, next) =>                     
  getTokenInfo(req.headers.authorization)            
    .then((user) => {
      res.locals.user = user;                           // Saves the data in res.locals.user
      next();                                           // Pass the control to the next middleware
    })
    .catch((error) => {
      console.log(error);                               // Logs errors
      res.status(error.statusCode).send(error.message); // Reply to the client
    });
```
Where `req.headers.authorization` contains the token of the user. The user data will be saved in `res.locals.user` and will be accessible to every route of your application. Then where you define routing, just add the middleware to the call stack:
`app.use('/your/api/endpoint', getUser, your_api_endpoint);`

**Alternatives:** `getTokenInfo` can be called in different ways:
1) with **1** parameter, `token`: in this case debug mode is disabled and the URL will be read from a .env file.
2) with **2** parameters, `token`, `url`: in this case debug mode is disabled too, but the URL inserted in the `url` parameter s
will be used.
3) with **3** parameters, `token`, `url`, `true`: this is like case 2. with debug enabled.
4) with **3** parameters, `token`, `undefined`, `true`: this is like case 1. with debug enabled.

**Debug:** debug can be enabled by calling `getTokenInfo` functions with third parameter set to true.
In debug mode, the full response object and all the variables will be printed on stdout.
# Disclaimer
This package doesn't check the integrity of the JWT/Token: it simply extracts it from the `authorization header`, parses it from the format `'Bearer <token>'` and forwards it to Auth0 servers. For this reason, it is recommended to check the token validity **before** calling this function, using for example the package `express-jwt` if using `express`.

**I don't work for and I'm not endorsed by Auth0, and this isn't a official package provided by Auth0. See LICENSE for more details.**

# Comment, suggestions
Comments and suggestions are always welcomed.

# TODO
- Write more tests
- Add some badge in the readme