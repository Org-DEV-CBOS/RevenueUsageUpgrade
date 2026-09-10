import { appUrl } from './app-url';

export const environment = {
  production: true,
  apiUrl: 'https://localhost:7068/api',
  bypassAuth: false,
  oidc: {
    issuer: 'https://howeya.cbos.gov.sd/',
    clientId: 'ruts.web.client',
    redirectUri: appUrl('callback'),
    postLogoutRedirectUri: appUrl('login'),
    scope: 'openid profile email roles ruts.api.scope offline_access organization',
    requireHttps: true,
  },
};
