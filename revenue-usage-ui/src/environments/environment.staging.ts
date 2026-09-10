import { appUrl } from './app-url';

export const environment = {
  production: false,
  apiUrl: 'https://dev-staging.cbos.gov.sd/RUTS-Api/api',
  bypassAuth: false,
  oidc: {
    issuer: 'https://dev-staging.cbos.gov.sd:5000/',
    clientId: 'ruts.web.client',
    redirectUri: appUrl('callback'),
    postLogoutRedirectUri: appUrl('login'),
    scope: 'openid profile email roles ruts.api.scope offline_access organization',
    requireHttps: true,
  },
};
