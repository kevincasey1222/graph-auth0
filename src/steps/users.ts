import {
  createDirectRelationship,
  createIntegrationEntity,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../config';
import { DATA_ACCOUNT_ENTITY } from './account';

export async function fetchUsers({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);

  const accountEntity = (await jobState.getData(DATA_ACCOUNT_ENTITY)) as Entity;

  await apiClient.iterateUsers(async (user) => {
    //weblink uses the user_id, but user_id has the pipe '|' in it,
    //and the SDK doesn't like it for validating URI format, so converting
    //%7C is '|'
    const weblink = accountEntity.webLink + 'users/auth0%7C' + user.user_id?.substring(6);
    //unspecified content fields to delete for safety
    delete user.user_metadata;
    delete user.app_metadata;
    const userEntity = await jobState.addEntity(
      createIntegrationEntity({
        entityData: {
          source: user,
          assign: {
            _key: user.user_id,
            _type: 'auth0_user',
            _class: 'User',
            name: user.name,
            displayName: user.name,
            username: user.username || '',
            nickname: user.nickname,
            email: user.email,
            webLink: weblink,
            userId: user.user_id,
            emailVerified: user.email_verified,
            phoneNumber: user.phone_number,
            phoneVerified: user.phone_verified,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            identities: JSON.stringify(user.identities), //array of objects
            picture: user.picture, //url
            multifactor: user.multifactor, //string[]
            lastIp: user.last_ip,
            lastLogin: user.last_login,
            loginsCount: user.logins_count,
            blocked: user.blocked,
            givenName: user.given_name,
            familyName: user.family_name,
          },
        },
      }),
    );

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: userEntity,
      }),
    );
  });
}

export const userSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-users',
    name: 'Fetch Users',
    entities: [
      {
        resourceName: 'User',
        _type: 'auth0_user',
        _class: 'User',
      },
    ],
    relationships: [
      {
        _type: 'auth0_account_has_user',
        _class: RelationshipClass.HAS,
        sourceType: 'auth0_account',
        targetType: 'auth0_user',
      },
    ],
    dependsOn: ['fetch-account'],
    executionHandler: fetchUsers,
  },
];
