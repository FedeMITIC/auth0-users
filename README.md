# Auth0-users

# Purpose of this package
Auht0-users is a simple package used to query the `/tokeninfo` endpoint provided by Auth0 services.
This endpoint contains all the data of the user associated with the token/jwt sent.
The data returned from the server cannot be customized using this package, but must be edited using the Auth0 dashboard.

# Usage
First, load the package in your code:

`const user = require('auth0-users');`

Then, call the function getTokenInfo to retrieve the data

`user.getTokenInfo(token, endpointUrl);

`getTokenInfo` always returns a promise, so chain it with `.then()` and `.catch()`
methods to handle promise resolution and rejection.

This package can also be used as a middleware to retrieve the user data when he/she's
querying one of your API endpoint. See the example commented code below:

```
const getUser = (req, res, next) => {   // Middleware name
  user.getTokenInfo(req.headers.authorization)
    .then((loggedUser) => {             // then() handler.
      res.locals.user = loggedUser;     // Save the user data on success.
      next();                           // Pass the control to the next middleware.
    })
    .catch((error) => {                 // Catch errors and log them.
      console.log(error);               // Handle errors.
    });
};
```
Where `req.headers.authorization` contains the token of the user. The user data will be saved in `res.locals.user` and will be accessible to every route of your application. Then where you define routing, just add the middleware to the call stack:
`app.use('/your/api/endpoint', getUser, your_api_endpoint);`

# Disclaimer
This package doesn't check the integrity of the JWT/Token: it simply extracts it from the `authorization header`, parses it from the format `'Bearer <token>'` and forwards it to Auth0 servers. For this reason, it is recommended to check the token validity **before** calling this function, using for example the package `express-jwt` if using `express`.

**I don't work for and I'm not endorsed by Auth0, and this isn't a official package provided by Auth0. See LICENSE for more details.**

# Comment, suggestions
Comments and suggestions are always welcomed.

# TODO
Write more tests
Integrate with Travis CI
Add some badge in the readme
Publish on NPM