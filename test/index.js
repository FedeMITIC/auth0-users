/* eslint-disable prefer-destructuring */
/**
 * Load chai library to use chai.expect.
 * @type {Object}
 */
const chai = require('chai');
const getTokenInfo = require('../index');

const expect = chai.expect;
const token = 'Bearer <insert your token here>';
const url = 'username.region.auth0.com';

describe('getTokenInfo function: ', () => {
  it('should reject the promise if no arguments are present', () => getTokenInfo(token, url)
    .then((result) => {
      expect(result).to.be.a('object', 'The returned value is not of type Object.');
    })
    .catch((error) => {
      throw new Error(error);
    }));
});
