import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationError, Router, RouterOutlet } from '@angular/router';
import { filter, take } from 'rxjs';
import { AppSplashComponent } from './shared/components/app-splash/app-splash.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, AppSplashComponent],
  // The splash overlays the outlet rather than replacing it: the router needs the
  // outlet present to activate the first route into.
  template: `
    <router-outlet />
    @if (booting()) {
      <app-splash />
    }
    <app-toast-container />
  `,
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);

  /** The first navigation blocks on the auth guards resolving OIDC discovery. */
  readonly booting = signal(true);

  constructor() {
    this.router.events
      .pipe(
        // A guard redirect cancels the first navigation and starts another, so wait
        // for an End rather than hiding the splash on the cancellation.
        filter((event) => event instanceof NavigationEnd || event instanceof NavigationError),
        take(1),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.booting.set(false));
  }
}
