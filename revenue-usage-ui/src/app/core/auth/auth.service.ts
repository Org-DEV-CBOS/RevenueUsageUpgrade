import { Injectable, signal, computed, isDevMode } from '@angular/core';
import { OAuthService, AuthConfig, OAuthErrorEvent } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SYSTEM_USER } from '../constants/system-user';
import { ROLE_ADMIN, roleLabelKey as toRoleLabelKey } from './roles';

export interface RutsUserProfile {
  userId: string;
  userName: string;
  fullNameAr: string;
  email: string;
  roles: string[];
  activeRoleId: string | null;
  organizationId: string;
  organizationName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _profile = signal<RutsUserProfile | null>(null);
  private _activeRoleId = signal<string | null>(this.getStoredActiveRoleId());

  private configured = false;
  private configurePromise: Promise<void> | null = null;
  private authEventsRegistered = false;

  readonly profile = this._profile.asReadonly();
  readonly activeRoleId = this._activeRoleId.asReadonly();
  readonly isLoggedIn = computed(
    () => (isDevMode() && environment.bypassAuth) || this.oauthService.hasValidAccessToken(),
  );
  readonly displayName = computed(() => {
    const profile = this._profile();
    if (!profile) return '';
    return profile.fullNameAr || profile.userName || profile.email;
  });
  readonly roleLabelKey = computed(() =>
    toRoleLabelKey(this._activeRoleId() ?? this._profile()?.roles[0] ?? null),
  );
  readonly isAdmin = computed(() => {
    const roles = this._profile()?.roles ?? [];
    return this._activeRoleId() === ROLE_ADMIN || roles.includes(ROLE_ADMIN);
  });

  constructor(
    private oauthService: OAuthService,
    private router: Router,
  ) {}

  async configure(): Promise<void> {
    if (this.configured) return;
    if (this.configurePromise) return this.configurePromise;

    this.configurePromise = this.configureInternal();
    try {
      await this.configurePromise;
      this.configured = true;
    } finally {
      this.configurePromise = null;
    }
  }

  login(): void {
    this.oauthService.initCodeFlow();
  }

  logout(): void {
    this.clearAuthContext();
    this.oauthService.logOut();
  }

  getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  setActiveRole(roleId: string): void {
    this._activeRoleId.set(roleId);
    sessionStorage.setItem('ruts_activeRoleId', roleId);
  }

  getStoredActiveRoleId(): string | null {
    return sessionStorage.getItem('ruts_activeRoleId');
  }

  defaultPath(): string {
    return this.isAdmin() ? '/admin/dashboard' : '/app/dashboard';
  }

  actor(): string {
    const profile = this._profile();
    return profile?.userName || profile?.email || profile?.userId || SYSTEM_USER;
  }

  clearAuthContext(): void {
    this._profile.set(null);
    this._activeRoleId.set(null);
    sessionStorage.removeItem('ruts_activeRoleId');
  }

  private async configureInternal(): Promise<void> {
    if (isDevMode() && environment.bypassAuth) {
      this.applyDevBypassProfile();
      return;
    }

    this.oauthService.setStorage(sessionStorage);

    const authConfig: AuthConfig = {
      issuer: environment.oidc.issuer,
      clientId: environment.oidc.clientId,
      redirectUri: environment.oidc.redirectUri,
      postLogoutRedirectUri: environment.oidc.postLogoutRedirectUri,
      responseType: 'code',
      scope: environment.oidc.scope,
      requireHttps: environment.oidc.requireHttps,
      showDebugInformation: !environment.production,
      clearHashAfterLogin: true,
      strictDiscoveryDocumentValidation: false,
      disableAtHashCheck: true,
    };

    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();
    this.registerAuthEvents();

    try {
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();
      if (this.oauthService.hasValidAccessToken()) {
        this.extractProfile();
      }
    } catch (err) {
      if (!environment.production) console.error('[Auth] configure failed', err);
    }
  }

  private applyDevBypassProfile(): void {
    if (!this._activeRoleId()) {
      this._activeRoleId.set(ROLE_ADMIN);
      sessionStorage.setItem('ruts_activeRoleId', ROLE_ADMIN);
    }
    this._profile.set({
      userId: 'dev-bypass',
      userName: 'Dev Tester',
      fullNameAr: 'مستخدم تجريبي',
      email: 'dev-bypass@local.test',
      roles: [ROLE_ADMIN],
      activeRoleId: this._activeRoleId(),
      organizationId: '',
      organizationName: '',
    });
  }

  private extractProfile(): void {
    const claims = this.oauthService.getIdentityClaims() as Record<string, unknown> | null;
    if (!claims) return;
    const roles: string[] = [];
    const addRole = (r: unknown) => {
      const s = String(r).trim();
      if (s && !roles.includes(s)) roles.push(s);
    };

    const collectRoles = (source: Record<string, unknown> | null | undefined) => {
      if (!source) return;
      for (const key of ['role', 'roles']) {
        const value = source[key];
        if (Array.isArray(value)) value.forEach(addRole);
        else if (value != null) addRole(value);
      }
    };

    collectRoles(claims);

    try {
      const at = this.oauthService.getAccessToken();
      if (at) {
        collectRoles(JSON.parse(atob(at.split('.')[1])) as Record<string, unknown>);
      }
    } catch {
      /* ignore malformed token */
    }

    const storedRole = this._activeRoleId();
    const preferred = roles.includes(ROLE_ADMIN) ? ROLE_ADMIN : roles[0];
    const nextRole =
      storedRole && roles.includes(storedRole) ? storedRole : preferred ?? null;
    if (nextRole && nextRole !== storedRole) {
      this._activeRoleId.set(nextRole);
      sessionStorage.setItem('ruts_activeRoleId', nextRole);
    }

    this._profile.set({
      userId: String(claims['sub'] ?? ''),
      userName: String(claims['name'] ?? ''),
      fullNameAr: String(claims['full_name_ar'] ?? claims['preferred_username'] ?? ''),
      email: String(claims['email'] ?? ''),
      roles,
      activeRoleId: this._activeRoleId(),
      organizationId: String(claims['org_id'] ?? ''),
      organizationName: String(claims['org_name'] ?? ''),
    });
  }

  private registerAuthEvents(): void {
    if (this.authEventsRegistered) return;
    this.authEventsRegistered = true;

    this.oauthService.events.subscribe((event) => {
      if (event.type === 'session_terminated') {
        this.forceReauth();
        return;
      }

      if (event.type === 'token_expires') {
        if (!this.oauthService.hasValidAccessToken()) {
          this.forceReauth();
        }
        return;
      }

      if (event instanceof OAuthErrorEvent) {
        const errType = (event as OAuthErrorEvent & { type: string }).type;
        if (errType === 'silent_refresh_error' || errType === 'token_refresh_error') {
          if (!environment.production) {
            console.warn('[Auth] Token refresh failed (session still active):', event);
          }
          return;
        }

        if (!this.oauthService.hasValidAccessToken()) {
          this.forceReauth();
        } else if (!environment.production) {
          console.warn('[Auth] OAuthErrorEvent (token still valid, ignoring):', event);
        }
      }
    });
  }

  private forceReauth(): void {
    this.clearAuthContext();
    this.oauthService.logOut();
    void this.router.navigate(['/login']);
  }
}
