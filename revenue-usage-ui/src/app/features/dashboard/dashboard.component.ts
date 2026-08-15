import { Component, OnInit, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ReportsApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="dashboard">
      <h1>{{ 'DASHBOARD.TITLE' | translate }}</h1>
      <p class="welcome">{{ 'DASHBOARD.WELCOME' | translate }}</p>

      <div class="stats-grid">
        <article class="stat-card">
          <span>{{ 'DASHBOARD.TOTAL_BALANCE' | translate }}</span>
          <strong>{{ summary?.['totalBalance'] ?? '—' }}</strong>
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
  imports: [TranslatePipe],
  template: `
    <div class="dashboard">
      <h1>{{ 'DASHBOARD.TITLE' | translate }}</h1>
      <p class="welcome">{{ 'DASHBOARD.WELCOME' | translate }} · Admin</p>

      <div class="stats-grid">
        <article class="stat-card accent">
          <span>{{ 'NAV.BANKS' | translate }}</span>
          <strong>Admin</strong>
        </article>
        <article class="stat-card accent">
          <span>{{ 'NAV.COMPANIES' | translate }}</span>
          <strong>Admin</strong>
        </article>
        <article class="stat-card accent">
          <span>{{ 'NAV.CORRESPONDENTS' | translate }}</span>
          <strong>Admin</strong>
        </article>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent {}
