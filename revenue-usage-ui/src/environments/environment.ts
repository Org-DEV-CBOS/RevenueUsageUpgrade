export const environment = {
  production: false,
  apiUrl: '/api',
  bypassAuth: false,
  oidc: {
    issuer: 'https://dev-staging.cbos.gov.sd:5000/',
    clientId: 'ruts.web.client',
    redirectUri: window.location.origin + '/callback',
    postLogoutRedirectUri: window.location.origin + '/login',
    scope: 'openid profile email roles ruts.api.scope offline_access organization',
    requireHttps: false,
  },
};
