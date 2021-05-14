import { Auth0UsersIncludeTotal } from './users';
import { Auth0Client } from './clients';

/**
 * Provides a TypeScript definition for the node-auth0 client, https://github.com/auth0/node-auth0
 * See https://auth0.github.io/node-auth0/ under ManagementClient for a full list of functions.
 * This type will only expose the functions used in this integration.
 *
 * Note that functions will return unauthorized unless that operation is specifically permitted by
 * the scope of the Oauth token returned, which requires for that scope to be permitted in the
 * Auth0 management console located at https://manage.auth0.com/dashboard/{REGION}/{YOURDOMAIN}/
 *
 * For raw details on the API endpoints (not the functions of this client), check
 * https://auth0.com/docs/api/management/v2/
 * This will provide schema details of returned objects.
 */
export interface Auth0ManagementClient {
  // [API Endpoint]: https://auth0.github.io/node-auth0/module-management.ManagementClient.html#getUsers
  // if the parameter "include_totals: true" is NOT included in params, then:
  // getUsers: (params?: object) => Promise<Auth0User[]>;
  // if the parameter "include_totals: true" IS included in params, then:
  getUsers: (params: object) => Promise<Auth0UsersIncludeTotal>;

  // [API Endpoint]: https://auth0.github.io/node-auth0/module-management.ManagementClient.html#getClients
  getClients: (params?: object) => Promise<Auth0Client[]>;
}
