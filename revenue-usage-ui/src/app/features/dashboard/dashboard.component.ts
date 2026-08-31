import { Component, OnInit, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardSummary } from '../../core/models/common.model';
import { ReportsApiService } from '../../core/services/api.service';
import { extractHttpError } from '../../core/utils/http-error.util';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [TranslatePipe, MoneyPipe, DecimalPipe, RouterLink],
  template: `
    @if (loading()) {
      <p>{{ 'COMMON.LOADING' | translate }}</p>
    } @else if (error()) {
      <div class="error-banner">{{ error() }}</div>
    } @else if (summary(); as stats) {
      <h3 class="dashboard-section">{{ 'DASHBOARD.FINANCIAL' | translate }}</h3>
      <div class="stats-grid">
        <article class="stat-card accent">
          <span>{{ 'DASHBOARD.NET_POSITION' | translate }}</span>
          <strong>{{ stats.netPositionUsd | money }}</strong>
        </article>
        <article class="stat-card">
          <span>{{ 'DASHBOARD.TOTAL_BALANCE' | translate }}</span>
          <strong>{{ stats.totalAccountBalance | money }}</strong>
        </article>
        <article class="stat-card">
          <span>{{ 'DASHBOARD.TOTAL_RESOURCES' | translate }}</span>
          <strong>{{ stats.totalResourcesUsd | money }}</strong>
        </article>
        <article class="stat-card">
          <span>{{ 'DASHBOARD.CONFIRMED_TRANSFERS' | translate }}</span>
          <strong>{{ stats.confirmedTransfersUsd | money }}</strong>
        </article>
        <article class="stat-card">
          <span>{{ 'DASHBOARD.OUTSTANDING_OBLIGATIONS' | translate }}</span>
          <strong>{{ stats.outstandingObligationsUsd | money }}</strong>
        </article>
        <article class="stat-card">
          <span>{{ 'DASHBOARD.RESERVES' | translate }}</span>
          <strong>{{ stats.reserveTotalUsd | money }}</strong>
        </article>
      </div>

      <h3 class="dashboard-section">{{ 'DASHBOARD.COUNTS' | translate }}</h3>
      <div class="stats-grid">
        <article class="stat-card">
          <span>{{ 'DASHBOARD.PENDING_TRANSFERS' | translate }}</span>
          <strong>{{ stats.pendingTransferCount | number }}</strong>
        </article>
        <article class="stat-card">
          <span>{{ 'DASHBOARD.CONFIRMED_TRANSFER_COUNT' | translate }}</span>
          <strong>{{ stats.confirmedTransferCount | number }}</strong>
        </article>
        <article class="stat-card">
          <span>{{ 'DASHBOARD.ACTIVE_OBLIGATIONS' | translate }}</span>
          <strong>{{ stats.obligationCount | number }}</strong>
        </article>
        <article class="stat-card">
          <span>{{ 'NAV.CORRESPONDENTS' | translate }}</span>
          <strong>{{ stats.correspondentCount | number }}</strong>
        </article>
        <article class="stat-card">
          <span>{{ 'DASHBOARD.ACCOUNTS' | translate }}</span>
          <strong>{{ stats.accountCount | number }}</strong>
        </article>
        <article class="stat-card">
          <span>{{ 'NAV.BENEFICIARIES' | translate }}</span>
          <strong>{{ stats.beneficiaryCount | number }}</strong>
        </article>
        <article class="stat-card">
          <span>{{ 'NAV.CURRENCIES' | translate }}</span>
          <strong>{{ stats.currencyCount | number }}</strong>
        </article>
        <article class="stat-card">
          <span>{{ 'NAV.RESOURCES' | translate }}</span>
          <strong>{{ stats.resourceTypeCount | number }}</strong>
        </article>
      </div>

      @if (showMasterData()) {
        <h3 class="dashboard-section">{{ 'DASHBOARD.MASTER_DATA' | translate }}</h3>
        <div class="stats-grid">
          <a routerLink="/admin/banks" class="stat-card accent">
            <span>{{ 'NAV.BANKS' | translate }}</span>
            <strong>{{ stats.bankCount | number }}</strong>
          </a>
          <a routerLink="/admin/companies" class="stat-card accent">
            <span>{{ 'NAV.COMPANIES' | translate }}</span>
            <strong>{{ stats.companyCount | number }}</strong>
          </a>
          <a routerLink="/admin/correspondents" class="stat-card accent">
            <span>{{ 'NAV.CORRESPONDENTS' | translate }}</span>
            <strong>{{ stats.correspondentCount | number }}</strong>
          </a>
          <a routerLink="/admin/countries" class="stat-card accent">
            <span>{{ 'NAV.COUNTRIES' | translate }}</span>
            <strong>{{ stats.countryCount | number }}</strong>
          </a>
        </div>
      }
    }
  `,
})
export class DashboardStatsComponent implements OnInit {
  readonly showMasterData = input(false);

  private readonly reportsApi = inject(ReportsApiService);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly summary = signal<DashboardSummary | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    this.reportsApi.getDashboard().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(extractHttpError(err));
      },
    });
  }
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [TranslatePipe, DashboardStatsComponent],
  template: `
    <div class="dashboard">
      <h1>{{ 'DASHBOARD.TITLE' | translate }}</h1>
      <p class="welcome">{{ 'DASHBOARD.WELCOME' | translate:{ name: auth.displayName() } }}</p>
      <app-dashboard-stats />
    </div>
  `,
})
export class UserDashboardComponent {
  readonly auth = inject(AuthService);
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [TranslatePipe, DashboardStatsComponent],
  template: `
    <div class="dashboard">
      <h1>{{ 'DASHBOARD.TITLE' | translate }}</h1>
      <p class="welcome">{{ 'DASHBOARD.WELCOME' | translate:{ name: auth.displayName() } }}</p>
      <app-dashboard-stats [showMasterData]="true" />
    </div>
  `,
})
export class AdminDashboardComponent {
  readonly auth = inject(AuthService);
}
