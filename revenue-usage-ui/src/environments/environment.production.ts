export const environment = {
  production: true,
  apiUrl: 'https://localhost:7068/api',
  bypassAuth: false,
  oidc: {
    issuer: 'https://howeya.cbos.gov.sd/',
    clientId: 'ruts.web.client',
    redirectUri: window.location.origin + '/callback',
    postLogoutRedirectUri: window.location.origin + '/login',
    scope: 'openid profile email roles ruts.api.scope offline_access organization',
    requireHttps: true,
  },
};
