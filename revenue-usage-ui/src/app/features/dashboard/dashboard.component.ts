import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { ReportsApiService } from '../../core/services/api.service';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [TranslatePipe, MoneyPipe],
  template: `
    <div class="dashboard">
      <h1>{{ 'DASHBOARD.TITLE' | translate }}</h1>
      <p class="welcome">{{ 'DASHBOARD.WELCOME' | translate:{ name: auth.displayName() } }}</p>

      <div class="stats-grid">
        <article class="stat-card">
          <span>{{ 'DASHBOARD.TOTAL_BALANCE' | translate }}</span>
          <strong>{{ summary?.['totalBalance'] | money }}</strong>
        </article>
        <article class="stat-card">
          <span>{{ 'DASHBOARD.ACTIVE_OBLIGATIONS' | translate }}</span>
          <strong>{{ summary?.['activeObligations'] ?? '—' }}</strong>
        </article>
        <article class="stat-card">
          <span>{{ 'DASHBOARD.PENDING_TRANSFERS' | translate }}</span>
          <strong>{{ summary?.['pendingTransfers'] ?? '—' }}</strong>
        </article>
      </div>
    </div>
  `,
})
export class UserDashboardComponent implements OnInit {
  private readonly reportsApi = inject(ReportsApiService);
  readonly auth = inject(AuthService);

  summary: Record<string, string | number> | null = null;

  ngOnInit(): void {
    this.reportsApi.getDashboard().subscribe({
      next: (data) => (this.summary = data as Record<string, string | number>),
      error: () => (this.summary = null),
    });
  }
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  template: `
    <div class="dashboard">
      <h1>{{ 'DASHBOARD.TITLE' | translate }}</h1>
      <p class="welcome">{{ 'DASHBOARD.WELCOME' | translate:{ name: auth.displayName() } }}</p>

      <div class="stats-grid">
        <a routerLink="/admin/banks" class="stat-card accent">
          <span>{{ 'NAV.BANKS' | translate }}</span>
        </a>
        <a routerLink="/admin/companies" class="stat-card accent">
          <span>{{ 'NAV.COMPANIES' | translate }}</span>
        </a>
        <a routerLink="/admin/correspondents" class="stat-card accent">
          <span>{{ 'NAV.CORRESPONDENTS' | translate }}</span>
        </a>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent {
  readonly auth = inject(AuthService);
}
