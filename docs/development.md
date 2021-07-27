# Development

[Auth0's API schema](https://auth0.com/docs/api/management/v2/)
[Auth0 NodeJS client](https://github.com/auth0/node-auth0)
[Method documentation for NodeJS client](https://auth0.github.io/node-auth0/).
Look specifically under ManagementClient.

Conceptually, remember that the whole point of Auth0 as a service is for client
applications to connect to Auth0, hand over user credentials, and receive
authorization for some other purpose. The NodeJS client provided by Auth0 allows
one to setup these client applications, and the use case of connecting to the
Auth0 management API is considered just a special case of that general feature.

So, as you are reading documentation, sometimes you will see information that is
relevant to authorization for third-party apps, and that may or may not be
relevant to connecting to the Auth0 management API for this integration. This
integration uses the ManagementClient class of the NodeJs Auth0 client. The
other classes in the client are for implementing Auth0 as a service for a
production app.

## Prerequisites

To simplify authentication, this integration uses package `auth0`, a NodeJS
client that handles much of the authentication and actual API calls.

## Provider account setup

You can get a free account for 25 days:
[here](https://auth0.com/signup?place=header&type=button&text=sign%20up)

See ./jupiterone.md for details on provisioning the API connection.

## Authentication

Auth0 uses Oauth for authentication. There are many possible flows for this and
many tweakable settings, but the basic setup for is for an application to
identify itself with a Client ID and Client Secret, and then receive a token
from `{YOURDOMAIN}.auth.com/oauth/token`, and then present that token in an
Authorization header on future API requests (`Authorization: 'Bearer {TOKEN}'`).

This integration is using a nodejs client made by Auth0 that handles that behind
the scenes, so long as you supply Client ID, Client Secret, Domain and Audience.
Do NOT include `https://` in the Domain. It should typically be in the format
`{YOURDOMAIN}.{YOURREGION}.auth0.com`. DO include `https://` in the Audience. It
must be something like `https://{YOURDOMAIN}.{REGION}.auth0.com/api/v2/`.

If you are using a custom domain (e.g. `mycustomdomain.com`), you can use that
domain in the Domain config variable, but you still must use the default Auth0
tenant domain in the Audience config variable.

## Curl for verification

If you want to test your config variables with cUrl, here is the sequence: curl
--request POST --url 'https://{config.domain}/oauth/token' --header
'content-type: application/json' --data
'{"client_id":"{config.clientId}","client_secret":"{config.clientSecret}","audience":"{config.audience}","grant_type":"client_credentials"}'

If you can get an Access Token in the reply using that, then your config
variables are good.
