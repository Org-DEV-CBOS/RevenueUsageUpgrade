import { Component, ViewChild, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NavItem, SidebarNavComponent } from '../../shared/components/sidebar-nav/sidebar-nav.component';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, TranslatePipe, SidebarNavComponent],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-logo">A</div>
          <div>
            <h1>{{ 'APP.TITLE' | translate }}</h1>
            <p>Admin</p>
          </div>
        </div>
        <app-sidebar-nav #nav />
      </aside>

      <main class="main-content">
        <header class="topbar">
          <div>
            <h2>{{ 'NAV.DASHBOARD' | translate }} · Admin</h2>
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
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  @ViewChild('nav') set nav(sidebar: SidebarNavComponent | undefined) {
    if (!sidebar) {
      return;
    }

    sidebar.items = this.adminNavItems;
  }

  private readonly adminNavItems: NavItem[] = [
    { labelKey: 'NAV.DASHBOARD', icon: '🏠', route: '/admin/dashboard' },
    { labelKey: 'NAV.CORRESPONDENTS', icon: '🏦', route: '/admin/correspondents' },
    { labelKey: 'NAV.ACCOUNTS', icon: '💼', route: '/admin/accounts' },
    { labelKey: 'NAV.BANKS', icon: '🏛️', route: '/admin/banks' },
    { labelKey: 'NAV.COMPANIES', icon: '🏭', route: '/admin/companies' },
    { labelKey: 'NAV.COUNTRIES', icon: '🌍', route: '/admin/countries' },
    { labelKey: 'NAV.RESOURCES', icon: '📦', route: '/admin/resources' },
    { labelKey: 'NAV.BENEFICIARIES', icon: '👥', route: '/admin/beneficiaries' },
    { labelKey: 'NAV.CURRENCIES', icon: '💱', route: '/admin/currencies' },
  ];
}
