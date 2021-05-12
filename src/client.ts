const ManagementClient = require('auth0').ManagementClient;

import { IntegrationProviderAuthenticationError } from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './config';
import { Auth0ManagementClient } from './types/managementClient';
import { Auth0User } from './types/users';
import { Auth0Client } from './types/clients';

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

/**
 * An APIClient maintains authentication state and provides an interface to
 * third party data APIs.
 *
 * It is recommended that integrations wrap provider data APIs to provide a
 * place to handle error responses and implement common patterns for iterating
 * resources.
 */
export class APIClient {
  managementClient: Auth0ManagementClient;
  //retrieves a token automatically and applies it to subsequent requests
  //token expiration is configured on the auth0 site; default is 24 hours
  constructor(readonly config: IntegrationConfig) {
    this.managementClient = new ManagementClient({
      domain: config.domain,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });
  }

  public async verifyAuthentication(): Promise<void> {
    //lightweight authen check
    //limit the reply since we're just validating
    const params = {
      per_page: 1,
      page: 0,
    };

    try {
      await this.managementClient.getUsers(params);
    } catch (err) {
      throw new IntegrationProviderAuthenticationError({
        cause: err,
        endpoint: this.config.domain,
        status: err.status,
        statusText: err.statusText,
      });
    }
  }

  /**
   * Iterates each user resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateUsers(
    iteratee: ResourceIteratee<Auth0User>,
  ): Promise<void> {
    //Auth0 sets the per_page max at 100 (default is 50)
    //Also, they set an absolute max of 1000 users from any given query
    //When we ask for .getUsers() in the management client, it is hitting the API
    //with an unfiltered query against /api/v2/users, and that returns a max of 1000
    //(10 pages of 100 users each). Even though we're only asking for a specific page
    //of 100 users in a given call of .getUsers(), the API is selecting a max of 1000
    //users to draw that result from, which could lead to inconsistent results if there
    //are more than 1000 users in the system

    //Therefore, if there are more than 1000 users to ingest, we'll have to filter the
    //searches somehow. For example, we could iterate over the alphabet and get users by
    //the first letter of their name with this additional param:
    //
    //q: 'name:a*'
    //
    //We can filter on any user attribute. The specific best choice probably depends on
    //the use case. Filter query documentation is here:
    //https://auth0.com/docs/users/user-search/user-search-query-syntax
    // Client params syntax is here:
    //https://auth0.github.io/node-auth0/module-management.ManagementClient.html#getUsers

    let userCount: number = 1;
    let pageNum: number = 0;
    while (userCount > 0) {
      const params = {
        per_page: 100,
        page: pageNum,
      };
      const users: Auth0User[] = await this.managementClient.getUsers(params);
      userCount = users.length;
      pageNum = pageNum + 1;
      for (const user of users) {
        await iteratee(user);
      }
    }
  }

  /**
   * Iterates each client (ie. Application) resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateClients(
    iteratee: ResourceIteratee<Auth0Client>,
  ): Promise<void> {
    //see Users comments for API limitations, though they are unlikely to be a problem here
    let appCount: number = 1;
    let pageNum: number = 0;
    while (appCount > 0) {
      const params = {
        per_page: 100,
        page: pageNum,
      };
      const clients: Auth0Client[] = await this.managementClient.getClients(
        params,
      );
      appCount = clients.length;
      pageNum = pageNum + 1;
      for (const client of clients) {
        await iteratee(client);
      }
    }
  }
}

export function createAPIClient(config: IntegrationConfig): APIClient {
  return new APIClient(config);
}
