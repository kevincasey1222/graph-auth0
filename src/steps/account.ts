import {
  createIntegrationEntity,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../config';
import { getAcctWeblink } from '../util/getAcctWeblink';

export const DATA_ACCOUNT_ENTITY = 'DATA_ACCOUNT_ENTITY';
export const ACCOUNT_ENTITY_TYPE = 'auth0_account';

export async function fetchAccountDetails({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const webLink = getAcctWeblink(instance.config.domain);
  const accountEntity = await jobState.addEntity(
    createIntegrationEntity({
      entityData: {
        source: {
          id: `Auth0 Account`,
          name: 'Auth0 Account',
        },
        assign: {
          _key: `auth0-account:${instance.id}`,
          _type: ACCOUNT_ENTITY_TYPE,
          _class: 'Account',
          name: 'Auth0 Account',
          displayName: 'Auth0 Account',
          webLink: webLink,
        },
      },
    }),
  );

  await jobState.setData(DATA_ACCOUNT_ENTITY, accountEntity);
}

export const accountSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-account',
    name: 'Fetch Account Details',
    entities: [
      {
        resourceName: 'Auth0 Account',
        _type: ACCOUNT_ENTITY_TYPE,
        _class: 'Account',
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchAccountDetails,
  },
];
