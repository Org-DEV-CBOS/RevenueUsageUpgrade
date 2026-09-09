import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardCurrencyBalance, DashboardSummary } from '../../core/models/common.model';
import { ReportsApiService } from '../../core/services/api.service';
import { LanguageService } from '../../core/services/language.service';
import { extractHttpError } from '../../core/utils/http-error.util';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

interface ChartSlice {
  key: string;
  labelKey?: string;
  label?: string;
  labelEn?: string;
  labelAr?: string;
  icon?: string;
  value: number;
  color: string;
  percent: number;
  degrees: number;
  dashArray: string;
  dashOffset: number;
  path: string;
}

const DONUT_RADIUS = 54;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
const PIE_CX = 80;
const PIE_CY = 80;
const PIE_RADIUS = 68;
const CURRENCY_COLORS = [
  '#1d4ed8',
  '#0f766e',
  '#7c3aed',
  '#c2410c',
  '#be123c',
  '#0e7490',
  '#4d7c0f',
  '#b45309',
  '#4338ca',
  '#0369a1',
  '#a21caf',
  '#155e75',
];

function polar(angle: number): { x: number; y: number } {
  return {
    x: PIE_CX + PIE_RADIUS * Math.cos(angle),
    y: PIE_CY + PIE_RADIUS * Math.sin(angle),
  };
}

function pieSlicePath(startAngle: number, endAngle: number): string {
  const sweep = endAngle - startAngle;
  if (sweep >= 2 * Math.PI - 1e-6) {
    return `M ${PIE_CX} ${PIE_CY - PIE_RADIUS} A ${PIE_RADIUS} ${PIE_RADIUS} 0 1 1 ${PIE_CX} ${PIE_CY + PIE_RADIUS} A ${PIE_RADIUS} ${PIE_RADIUS} 0 1 1 ${PIE_CX} ${PIE_CY - PIE_RADIUS} Z`;
  }

  const start = polar(startAngle);
  const end = polar(endAngle);
  const large = sweep > Math.PI ? 1 : 0;
  return `M ${PIE_CX} ${PIE_CY} L ${start.x} ${start.y} A ${PIE_RADIUS} ${PIE_RADIUS} 0 ${large} 1 ${end.x} ${end.y} Z`;
}

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
      @if (stats.unconvertedCurrencyCount > 0) {
        <div class="warning-banner">
          {{ 'DASHBOARD.UNCONVERTED_WARNING' | translate: { count: stats.unconvertedCurrencyCount } }}
        </div>
      }
      <div class="stats-grid">
        <article class="stat-card tone-net">
          <span class="stat-icon" aria-hidden="true">💼</span>
          <span class="stat-label">{{ 'DASHBOARD.NET_POSITION' | translate }}</span>
          <strong class="stat-value">{{ stats.netPositionUsd | money }}</strong>
        </article>
        <article class="stat-card tone-balance">
          <span class="stat-icon" aria-hidden="true">🏦</span>
          <span class="stat-label">{{ 'DASHBOARD.TOTAL_BALANCE' | translate }}</span>
          <strong class="stat-value">{{ stats.totalAccountBalance | money }}</strong>
        </article>
        <article class="stat-card tone-resources">
          <span class="stat-icon" aria-hidden="true">📦</span>
          <span class="stat-label">{{ 'DASHBOARD.TOTAL_RESOURCES' | translate }}</span>
          <strong class="stat-value">{{ stats.totalResourcesUsd | money }}</strong>
        </article>
        <article class="stat-card tone-transfers">
          <span class="stat-icon" aria-hidden="true">🔁</span>
          <span class="stat-label">{{ 'DASHBOARD.CONFIRMED_TRANSFERS' | translate }}</span>
          <strong class="stat-value">{{ stats.confirmedTransfersUsd | money }}</strong>
        </article>
        <article class="stat-card tone-obligations">
          <span class="stat-icon" aria-hidden="true">⚠️</span>
          <span class="stat-label">{{ 'DASHBOARD.OUTSTANDING_OBLIGATIONS' | translate }}</span>
          <strong class="stat-value">{{ stats.outstandingObligationsUsd | money }}</strong>
        </article>
        <article class="stat-card tone-reserves">
          <span class="stat-icon" aria-hidden="true">💎</span>
          <span class="stat-label">{{ 'DASHBOARD.RESERVES' | translate }}</span>
          <strong class="stat-value">{{ stats.reserveTotalUsd | money }}</strong>
        </article>
      </div>

      <h3 class="dashboard-section">{{ 'DASHBOARD.CURRENCY_MIX' | translate }}</h3>
      <section class="reserve-chart-panel" aria-labelledby="currency-chart-title">
        <div class="reserve-chart-head">
          <h4 id="currency-chart-title">{{ 'DASHBOARD.TOTAL_BALANCE' | translate }}</h4>
          <strong>{{ currencyMix().total | money }}</strong>
        </div>
        <div class="reserve-chart">
          <svg
            class="currency-pie"
            viewBox="0 0 160 160"
            role="img"
            [attr.aria-label]="'DASHBOARD.CURRENCY_MIX' | translate"
          >
            @if (currencyMix().total > 0) {
              @for (slice of currencyMix().slices; track slice.key) {
                <path class="currency-pie-slice" [attr.d]="slice.path" [attr.fill]="slice.color" />
              }
            } @else {
              <circle cx="80" cy="80" r="68" fill="#e8eef6" />
            }
          </svg>
          <div class="reserve-bars">
            @if (currencyMix().total > 0) {
              @for (slice of currencyMix().slices; track slice.key) {
                <div class="reserve-bar-row">
                  <div class="reserve-bar-meta">
                    <span class="reserve-swatch" [style.background]="slice.color"></span>
                    <span>{{ currencyName(slice) }}</span>
                    <strong>{{ slice.value | money }}</strong>
                    <em>{{ slice.percent | number: '1.0-1' }}% · {{ slice.degrees | number: '1.0-0' }}°</em>
                  </div>
                  <div class="reserve-bar-track">
                    <span
                      class="reserve-bar-fill"
                      [style.width.%]="slice.percent"
                      [style.background]="slice.color"
                    ></span>
                  </div>
                </div>
              }
            } @else {
              <p class="reserve-empty">{{ 'DASHBOARD.NO_CURRENCY_DATA' | translate }}</p>
            }
          </div>
        </div>
      </section>

      <h3 class="dashboard-section">{{ 'DASHBOARD.RESERVE_MIX' | translate }}</h3>
      <div class="reserve-layout">
        <div class="stats-grid reserve-cards">
          <article class="stat-card tone-cash">
            <span class="stat-icon" aria-hidden="true">💵</span>
            <span class="stat-label">{{ 'RESERVES.CASH' | translate }}</span>
            <strong class="stat-value">{{ stats.cashInHandUsd | money }}</strong>
          </article>
          <article class="stat-card tone-gold">
            <span class="stat-icon" aria-hidden="true">🥇</span>
            <span class="stat-label">{{ 'RESERVES.GOLD' | translate }}</span>
            <strong class="stat-value">{{ stats.goldValueUsd | money }}</strong>
          </article>
          <article class="stat-card tone-deposits">
            <span class="stat-icon" aria-hidden="true">🏛️</span>
            <span class="stat-label">{{ 'RESERVES.DEPOSITS' | translate }}</span>
            <strong class="stat-value">{{ stats.depositsUsd | money }}</strong>
          </article>
        </div>

        <section class="reserve-chart-panel" aria-labelledby="reserve-chart-title">
          <div class="reserve-chart-head">
            <h4 id="reserve-chart-title">{{ 'DASHBOARD.RESERVE_CHART' | translate }}</h4>
            <strong>{{ reserveMix().total | money }}</strong>
          </div>

          <div class="reserve-chart">
            <svg
              class="reserve-donut"
              viewBox="0 0 160 160"
              role="img"
              [attr.aria-label]="'DASHBOARD.RESERVE_CHART' | translate"
            >
              <circle class="reserve-donut-track" cx="80" cy="80" r="54" transform="rotate(-90 80 80)" />
              @if (reserveMix().total > 0) {
                @for (slice of reserveMix().slices; track slice.key) {
                  @if (slice.value > 0) {
                    <circle
                      class="reserve-donut-slice"
                      cx="80"
                      cy="80"
                      r="54"
                      transform="rotate(-90 80 80)"
                      [attr.stroke]="slice.color"
                      [attr.stroke-dasharray]="slice.dashArray"
                      [attr.stroke-dashoffset]="slice.dashOffset"
                    />
                  }
                }
              }
              <text class="reserve-donut-caption" x="80" y="76">{{ 'RESERVES.TOTAL' | translate }}</text>
              <text class="reserve-donut-total" x="80" y="96">{{ donutCenterLabel() }}</text>
            </svg>

            <div class="reserve-bars">
              @if (reserveMix().total > 0) {
                <div class="reserve-stack" aria-hidden="true">
                  @for (slice of reserveMix().slices; track slice.key) {
                    @if (slice.value > 0) {
                      <span
                        class="reserve-stack-seg"
                        [style.flex-grow]="slice.value"
                        [style.background]="slice.color"
                      ></span>
                    }
                  }
                </div>
                @for (slice of reserveMix().slices; track slice.key) {
                  <div class="reserve-bar-row">
                    <div class="reserve-bar-meta">
                      <span class="reserve-swatch" [style.background]="slice.color"></span>
                      <span>{{ slice.icon }} {{ slice.labelKey | translate }}</span>
                      <strong>{{ slice.value | money }}</strong>
                      <em>{{ slice.percent | number: '1.0-1' }}%</em>
                    </div>
                    <div class="reserve-bar-track">
                      <span
                        class="reserve-bar-fill"
                        [style.width.%]="slice.percent"
                        [style.background]="slice.color"
                      ></span>
                    </div>
                  </div>
                }
              } @else {
                <p class="reserve-empty">{{ 'DASHBOARD.NO_RESERVE_DATA' | translate }}</p>
              }
            </div>
          </div>
        </section>
      </div>

      <h3 class="dashboard-section">{{ 'DASHBOARD.COUNTS' | translate }}</h3>
      <div class="stats-grid">
        <article class="stat-card tone-pending light">
          <span class="stat-icon" aria-hidden="true">⏳</span>
          <span class="stat-label">{{ 'DASHBOARD.PENDING_TRANSFERS' | translate }}</span>
          <strong class="stat-value">{{ stats.pendingTransferCount | number }}</strong>
        </article>
        <article class="stat-card tone-confirmed light">
          <span class="stat-icon" aria-hidden="true">✅</span>
          <span class="stat-label">{{ 'DASHBOARD.CONFIRMED_TRANSFER_COUNT' | translate }}</span>
          <strong class="stat-value">{{ stats.confirmedTransferCount | number }}</strong>
        </article>
        <article class="stat-card tone-active-ob light">
          <span class="stat-icon" aria-hidden="true">📋</span>
          <span class="stat-label">{{ 'DASHBOARD.ACTIVE_OBLIGATIONS' | translate }}</span>
          <strong class="stat-value">{{ stats.obligationCount | number }}</strong>
        </article>
        <article class="stat-card tone-correspondents light">
          <span class="stat-icon" aria-hidden="true">🤝</span>
          <span class="stat-label">{{ 'NAV.CORRESPONDENTS' | translate }}</span>
          <strong class="stat-value">{{ stats.correspondentCount | number }}</strong>
        </article>
        <article class="stat-card tone-accounts light">
          <span class="stat-icon" aria-hidden="true">📒</span>
          <span class="stat-label">{{ 'DASHBOARD.ACCOUNTS' | translate }}</span>
          <strong class="stat-value">{{ stats.accountCount | number }}</strong>
        </article>
        <article class="stat-card tone-beneficiaries light">
          <span class="stat-icon" aria-hidden="true">👥</span>
          <span class="stat-label">{{ 'NAV.BENEFICIARIES' | translate }}</span>
          <strong class="stat-value">{{ stats.beneficiaryCount | number }}</strong>
        </article>
        <article class="stat-card tone-currencies light">
          <span class="stat-icon" aria-hidden="true">💱</span>
          <span class="stat-label">{{ 'NAV.CURRENCIES' | translate }}</span>
          <strong class="stat-value">{{ stats.currencyCount | number }}</strong>
        </article>
        <article class="stat-card tone-resource-types light">
          <span class="stat-icon" aria-hidden="true">🗂️</span>
          <span class="stat-label">{{ 'NAV.RESOURCES' | translate }}</span>
          <strong class="stat-value">{{ stats.resourceTypeCount | number }}</strong>
        </article>
      </div>

      @if (showMasterData()) {
        <h3 class="dashboard-section">{{ 'DASHBOARD.MASTER_DATA' | translate }}</h3>
        <div class="stats-grid">
          <a routerLink="/admin/banks" class="stat-card tone-banks">
            <span class="stat-icon" aria-hidden="true">🏦</span>
            <span class="stat-label">{{ 'NAV.BANKS' | translate }}</span>
            <strong class="stat-value">{{ stats.bankCount | number }}</strong>
          </a>
          <a routerLink="/admin/companies" class="stat-card tone-companies">
            <span class="stat-icon" aria-hidden="true">🏢</span>
            <span class="stat-label">{{ 'NAV.COMPANIES' | translate }}</span>
            <strong class="stat-value">{{ stats.companyCount | number }}</strong>
          </a>
          <a routerLink="/admin/correspondents" class="stat-card tone-correspondents-link">
            <span class="stat-icon" aria-hidden="true">🤝</span>
            <span class="stat-label">{{ 'NAV.CORRESPONDENTS' | translate }}</span>
            <strong class="stat-value">{{ stats.correspondentCount | number }}</strong>
          </a>
          <a routerLink="/admin/countries" class="stat-card tone-countries">
            <span class="stat-icon" aria-hidden="true">🌍</span>
            <span class="stat-label">{{ 'NAV.COUNTRIES' | translate }}</span>
            <strong class="stat-value">{{ stats.countryCount | number }}</strong>
          </a>
        </div>
      }
    }
  `,
})
export class DashboardStatsComponent implements OnInit {
  readonly showMasterData = input(false);

  private readonly reportsApi = inject(ReportsApiService);
  private readonly language = inject(LanguageService);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly summary = signal<DashboardSummary | null>(null);

  readonly reserveMix = computed(() => {
    const stats = this.summary();
    const items = [
      {
        key: 'cash',
        labelKey: 'RESERVES.CASH',
        icon: '💵',
        value: Math.max(stats?.cashInHandUsd ?? 0, 0),
        color: '#059669',
      },
      {
        key: 'gold',
        labelKey: 'RESERVES.GOLD',
        icon: '🥇',
        value: Math.max(stats?.goldValueUsd ?? 0, 0),
        color: '#d97706',
      },
      {
        key: 'deposits',
        labelKey: 'RESERVES.DEPOSITS',
        icon: '🏛️',
        value: Math.max(stats?.depositsUsd ?? 0, 0),
        color: '#0284c7',
      },
    ];
    const total = items.reduce((sum, item) => sum + item.value, 0);
    let offset = 0;
    const slices: ChartSlice[] = items.map((item) => {
      const percent = total > 0 ? (item.value / total) * 100 : 0;
      const length = total > 0 ? (item.value / total) * DONUT_CIRCUMFERENCE : 0;
      const slice: ChartSlice = {
        ...item,
        percent,
        degrees: (percent / 100) * 360,
        dashArray: `${length} ${DONUT_CIRCUMFERENCE}`,
        dashOffset: -offset,
        path: '',
      };
      offset += length;
      return slice;
    });
    return { total, slices };
  });

  readonly currencyMix = computed(() => {
    const rows = this.summary()?.currencyBalances ?? [];
    const items = rows
      .map((row: DashboardCurrencyBalance) => ({
        key: row.currencyId,
        labelEn: this.currencyLabel(row, false),
        labelAr: this.currencyLabel(row, true),
        value: Math.max(row.balanceUsd ?? 0, 0),
      }))
      .filter((item) => item.value > 0);
    const total = items.reduce((sum, item) => sum + item.value, 0);
    let angle = -Math.PI / 2;
    const slices: ChartSlice[] = items.map((item, index) => {
      const percent = total > 0 ? (item.value / total) * 100 : 0;
      const sweep = total > 0 ? (item.value / total) * 2 * Math.PI : 0;
      const start = angle;
      angle += sweep;
      return {
        ...item,
        color: CURRENCY_COLORS[index % CURRENCY_COLORS.length],
        percent,
        degrees: (percent / 100) * 360,
        dashArray: '',
        dashOffset: 0,
        path: pieSlicePath(start, angle),
      };
    });
    return { total, slices };
  });

  readonly donutCenterLabel = computed(() => {
    const total = this.reserveMix().total;
    if (!Number.isFinite(total) || total <= 0) {
      return '—';
    }
    if (total >= 1_000_000) {
      return `${(total / 1_000_000).toFixed(1)}M`;
    }
    if (total >= 1_000) {
      return `${(total / 1_000).toFixed(1)}K`;
    }
    return total.toFixed(0);
  });

  currencyName(slice: ChartSlice): string {
    const arabic = this.language.currentLanguage() === 'ar';
    return (arabic ? slice.labelAr : slice.labelEn) || slice.labelEn || slice.label || '';
  }

  private currencyLabel(row: DashboardCurrencyBalance, arabic: boolean): string {
    const name = (arabic ? row.currencyNameAr : row.currencyNameEn) || row.currencyNameEn || row.currencyCode;
    const symbol = row.currencySymbol || row.currencyCode;
    return symbol && symbol !== name ? `${name} (${symbol})` : name;
  }

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
