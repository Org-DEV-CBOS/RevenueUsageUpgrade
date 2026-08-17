import { Component, ViewChild, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NavItem, SidebarNavComponent } from '../../shared/components/sidebar-nav/sidebar-nav.component';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, TranslatePipe, SidebarNavComponent],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-logo">R</div>
          <div>
            <h1>{{ 'APP.TITLE' | translate }}</h1>
            <p>{{ 'APP.SUBTITLE' | translate }}</p>
          </div>
        </div>
        <app-sidebar-nav #nav />
      </aside>

      <main class="main-content">
        <header class="topbar">
          <div>
            <h2>{{ 'APP.SUBTITLE' | translate }}</h2>
          </div>
          @if (auth.displayName()) {
            <span class="topbar-user">{{ auth.displayName() }}</span>
          }
        </header>
        <section class="page-content">
          <router-outlet />
        </section>
      </main>
    </div>
  `,
})
export class UserLayoutComponent {
  readonly auth = inject(AuthService);
  @ViewChild('nav') set nav(sidebar: SidebarNavComponent | undefined) {
    if (!sidebar) {
      return;
    }

    sidebar.items = this.userNavItems;
  }

  private readonly userNavItems: NavItem[] = [
    { labelKey: 'NAV.DASHBOARD', icon: '🏠', route: '/app/dashboard' },
    { labelKey: 'NAV.ACCOUNTS', icon: '💼', route: '/app/accounts' },
    { labelKey: 'NAV.TRANSACTIONS', icon: '💸', route: '/app/transfers' },
    { labelKey: 'NAV.OBLIGATIONS', icon: '📋', route: '/app/obligations' },
    { labelKey: 'NAV.CURRENCIES', icon: '💱', route: '/app/currencies' },
    { labelKey: 'NAV.DEALING', icon: '📈', route: '/app/deals' },
    { labelKey: 'NAV.REPLENISHMENTS', icon: '🔄', route: '/app/coverages' },
    { labelKey: 'NAV.GOLD_AND_CASH', icon: '🥇', route: '/app/reserves' },
    {
      labelKey: 'NAV.REPORTS',
      icon: '📊',
      route: 'reports',
      children: [
        { labelKey: 'NAV.BALANCES', icon: '', route: '/app/reports/balances' },
        { labelKey: 'NAV.OBLIGATIONS', icon: '', route: '/app/reports/obligations' },
        { labelKey: 'NAV.FOREIGN_RESERVE', icon: '', route: '/app/reports/foreign-reserve' },
      ],
    },
  ];
}
