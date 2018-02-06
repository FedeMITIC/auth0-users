# Validation tests

Simple application setup using express framework to test the functionality provided by `auth0-retrieve-user`.
The `/users/` endpoints replies with the content of the token inserted in Authorization header. The middleware `getUser` is in charge of calling the module function that retrieves the data from Auth0.

### Set up

Before trying this test application, remember to either create a .ENV file with the field `AUTH0_INFO`, or to pass to `getTokenInfo` your auth0 domain as a string. 