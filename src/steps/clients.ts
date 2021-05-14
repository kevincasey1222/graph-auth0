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

export async function fetchClients({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);

  const accountEntity = (await jobState.getData(DATA_ACCOUNT_ENTITY)) as Entity;

  await apiClient.iterateClients(async (client) => {
    //the following properties are all security related and should be redacted
    delete client.client_secret;
    delete client.jwt_configuration;
    delete client.signing_keys;
    delete client.encryption_key;
    //the following properties contain objects with unknown data
    //deleting for security purposes, though it's possible they might be wanted later
    delete client.addons;
    delete client.client_metadata;
    delete client.mobile;
    delete client.native_social_login;
    //see schema in types/clients.ts for more on what these fields mean
    const clientEntity = await jobState.addEntity(
      createIntegrationEntity({
        entityData: {
          source: client,
          assign: {
            _key: client.client_id,
            _type: 'auth0_client',
            _class: 'Application',
            name: client.name,
            displayName: client.name,
            webLink:
              accountEntity.webLink +
              'applications/' +
              client.client_id +
              '/settings',
            clientId: client.client_id,
            tenant: client.tenant,
            description: client.description,
            global: client.global,
            appType: client.app_type,
            logoUri: client.logo_uri,
            isFirstParty: client.is_first_party,
            oidcConformant: client.oidc_conformant,
            callbacks: client.callbacks,
            allowedOrigins: client.allowed_origins,
            webOrigins: client.web_origins,
            clientAliases: client.client_aliases,
            allowedClients: client.allowed_clients,
            allowedLogoutUrls: client.allowed_logout_urls,
            grantTypes: client.grant_types,
            sso: client.sso,
            ssoDisabled: client.sso_disabled,
            crossOriginAuth: client.cross_origin_auth,
            crossOriginLoc: client.cross_origin_loc,
            customLoginPageOn: client.custom_login_page_on,
            customLoginPage: client.custom_login_page,
            customLoginPagePreview: client.custom_login_page_preview,
            formTemplate: client.form_template,
            tokenEndpointAuthMethod: client.token_endpoint_auth_method,
            initiateLoginUri: client.initiate_login_uri,
            organizationUsage: client.organization_usage,
            organizationRequireBehavior: client.organization_require_behavior,
            //the following fields are arguably security information useful to attackers
            //but also useful for security posture analysis
            tokenExpirationType: client.refresh_token?.expiration_type,
            tokenTokenLifetime: client.refresh_token?.token_lifetime,
            tokenInfiniteTokenLifetime:
              client.refresh_token?.infinite_token_lifetime,
            tokenIdleTokenLifetime: client.refresh_token?.idle_token_lifetime,
            tokenInfiniteIdleTokenLifetime:
              client.refresh_token?.infinite_idle_token_lifetime,
          },
        },
      }),
    );

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: clientEntity,
      }),
    );
  });
}

export const clientSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-clients',
    name: 'Fetch Clients',
    entities: [
      {
        resourceName: 'Auth0 Client',
        _type: 'auth0_client',
        _class: 'Application',
      },
    ],
    relationships: [
      {
        _type: 'auth0_account_has_client',
        _class: RelationshipClass.HAS,
        sourceType: 'auth0_account',
        targetType: 'auth0_client',
      },
    ],
    dependsOn: ['fetch-account'],
    executionHandler: fetchClients,
  },
];
