import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Covers the gap before the first route renders. The auth guards await the OIDC
 * discovery document, which can take a few seconds against the identity server,
 * and the router has nothing to show until that resolves.
 */
@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="app-splash" role="status" aria-live="polite">
      <img class="app-splash-logo" src="cbos-logo-white.png" alt="" />
      <p class="app-splash-title">{{ 'APP.SUBTITLE' | translate }}</p>
      <span class="app-splash-spinner" aria-hidden="true"></span>
      <p class="app-splash-hint">{{ 'APP.STARTING' | translate }}</p>
    </div>
  `,
})
export class AppSplashComponent {}
