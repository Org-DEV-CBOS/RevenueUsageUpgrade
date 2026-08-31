import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageToggleComponent } from '../../shared/components/language-toggle/language-toggle.component';
import { NavItem, SidebarNavComponent } from '../../shared/components/sidebar-nav/sidebar-nav.component';
import { UserMenuComponent } from '../../shared/components/user-menu/user-menu.component';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, TranslatePipe, SidebarNavComponent, UserMenuComponent, LanguageToggleComponent],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <img class="brand-logo" src="/cbos-logo-white.png" alt="CBOS" />
          <div>
            <h1>{{ 'APP.TITLE' | translate }}</h1>
            <p>{{ 'APP.SUBTITLE' | translate }}</p>
          </div>
        </div>
        <app-sidebar-nav [items]="userNavItems" />
      </aside>

      <main class="main-content">
        <header class="topbar">
          <div>
            <h2>{{ 'APP.SUBTITLE' | translate }}</h2>
          </div>
          <div class="topbar-actions">
            <app-language-toggle variant="light" />
            <app-user-menu />
          </div>
        </header>
        <section class="page-content">
          <router-outlet />
        </section>
      </main>
    </div>
  `,
})
export class UserLayoutComponent {
  readonly userNavItems: NavItem[] = [
    { labelKey: 'NAV.DASHBOARD', icon: '🏠', route: '/app/dashboard' },
    { labelKey: 'NAV.ACCOUNTS', icon: '💼', route: '/app/accounts' },
    { labelKey: 'NAV.TRANSACTIONS', icon: '💸', route: '/app/transfers' },
    { labelKey: 'NAV.OBLIGATIONS', icon: '📋', route: '/app/obligations' },
    { labelKey: 'NAV.CURRENCIES', icon: '💱', route: '/app/currencies' },
    { labelKey: 'NAV.EXCHANGE_RATES', icon: '💹', route: '/app/exchange-rates' },
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
