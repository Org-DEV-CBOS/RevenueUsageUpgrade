import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageToggleComponent } from '../../shared/components/language-toggle/language-toggle.component';
import { NavItem, SidebarNavComponent } from '../../shared/components/sidebar-nav/sidebar-nav.component';
import { UserMenuComponent } from '../../shared/components/user-menu/user-menu.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, TranslatePipe, SidebarNavComponent, UserMenuComponent, LanguageToggleComponent],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <img class="brand-logo" src="/cbos-logo-white.png" alt="CBOS" />
          <div>
            <h1>{{ 'APP.TITLE' | translate }}</h1>
            <p>Admin</p>
          </div>
        </div>
        <app-sidebar-nav [items]="adminNavItems" />
      </aside>

      <main class="main-content">
        <header class="topbar">
          <div>
            <h2>{{ 'NAV.DASHBOARD' | translate }}</h2>
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
export class AdminLayoutComponent {
  readonly adminNavItems: NavItem[] = [
    { labelKey: 'NAV.DASHBOARD', icon: '🏠', route: '/admin/dashboard' },
    { labelKey: 'NAV.CORRESPONDENTS', icon: '🏦', route: '/admin/correspondents' },
    { labelKey: 'NAV.ACCOUNTS', icon: '💼', route: '/admin/accounts' },
    { labelKey: 'NAV.BENEFICIARIES', icon: '👥', route: '/admin/beneficiaries' },
    { labelKey: 'NAV.RESOURCES', icon: '📦', route: '/admin/resources' },
    { labelKey: 'NAV.BANKS', icon: '🏛️', route: '/admin/banks' },
    { labelKey: 'NAV.COMPANIES', icon: '🏭', route: '/admin/companies' },
    { labelKey: 'NAV.COUNTRIES', icon: '🌍', route: '/admin/countries' },
    { labelKey: 'NAV.CURRENCIES', icon: '💱', route: '/admin/currencies' },
  ];
}
