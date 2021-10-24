// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'r02nhnglnd';
export const apiEndpoint = `https://${apiId}.execute-api.eu-west-1.amazonaws.com/dev`;

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'sls-serverless-test.eu.auth0.com',            // Auth0 domain
  clientId: 'CypZL45Suek6UYYi0CbuQSXo7lC3Q5Bg',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
};
