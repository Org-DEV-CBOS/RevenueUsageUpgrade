import { Route, Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard, homeRedirectGuard } from './core/auth/auth.guard';
import { HomeRedirectComponent } from './features/auth/callback.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';
import { AdminDashboardComponent, UserDashboardComponent } from './features/dashboard/dashboard.component';
import { BankFormComponent, BankListComponent } from './features/banks/bank-pages.component';
import { CompanyFormComponent, CompanyListComponent } from './features/companies/company-pages.component';
import { CountryFormComponent, CountryListComponent } from './features/countries/country-pages.component';
import { TransferListComponent } from './features/transfers/transfer-list.component';
import { TransferFormComponent } from './features/transfers/transfer-form.component';
import { API_PAGE_CONFIGS, ApiRoutePageComponent } from './features/api-pages/api-route-page.component';
import { REPORT_CONFIGS, ReportPageComponent } from './features/reports/report-page.component';
import {
  ResourceEntryFormComponent,
  ResourceEntryListComponent,
} from './features/operations/resource-pages.component';
import {
  CoverageFormComponent,
  CoverageListComponent,
} from './features/operations/coverage-pages.component';
import { DealFormComponent, DealListComponent } from './features/operations/deal-pages.component';
import {
  ObligationDetailComponent,
  ObligationFormComponent,
  ObligationListComponent,
} from './features/operations/obligation-pages.component';
import {
  ReserveFormComponent,
  ReserveListComponent,
} from './features/operations/reserve-pages.component';
import {
  AccountStatementComponent,
  BankPositionComponent,
  CurrencyStatementComponent,
} from './features/statements/statement-pages.component';
import {
  AccountFormComponent,
  AccountListComponent,
  BeneficiaryFormComponent,
  BeneficiaryListComponent,
  ClientTypeFormComponent,
  ClientTypeListComponent,
  CurrencyFormComponent,
  CurrencyListComponent,
  ObligationTypeFormComponent,
  ObligationTypeListComponent,
  ResourceFormComponent,
  ResourceListComponent,
} from './features/admin/admin-entity-pages.component';
import {
  CorrespondentFormComponent,
  CorrespondentListComponent,
} from './features/admin/correspondents-pages.component';

function apiRoute(path: string, key: keyof typeof API_PAGE_CONFIGS): Route {
  return {
    path,
    component: ApiRoutePageComponent,
    data: { apiPage: API_PAGE_CONFIGS[key] },
  };
}

function reportRoute(path: string, key: keyof typeof REPORT_CONFIGS): Route {
  return {
    path,
    component: ReportPageComponent,
    data: { report: REPORT_CONFIGS[key] },
  };
}

export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], component: HomeRedirectComponent },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'callback',
    loadComponent: () => import('./features/auth/callback.component').then((m) => m.CallbackComponent),
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./features/auth/forbidden.component').then((m) => m.ForbiddenComponent),
  },
  {
    path: 'app',
    component: UserLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: UserDashboardComponent },
      apiRoute('accounts', 'accounts'),

      { path: 'resources', component: ResourceEntryListComponent },
      { path: 'resources/create', component: ResourceEntryFormComponent },

      { path: 'transfers', component: TransferListComponent },
      { path: 'transfers/create', component: TransferFormComponent },

      { path: 'coverages', component: CoverageListComponent },
      { path: 'coverages/create', component: CoverageFormComponent },

      { path: 'deals', component: DealListComponent },
      { path: 'deals/create', component: DealFormComponent },

      { path: 'obligations', component: ObligationListComponent },
      { path: 'obligations/create', component: ObligationFormComponent },
      { path: 'obligations/:id', component: ObligationDetailComponent },

      { path: 'reserves', component: ReserveListComponent },
      { path: 'reserves/create', component: ReserveFormComponent },

      apiRoute('currencies', 'currencies'),
      apiRoute('exchange-rates', 'exchangeRates'),

      { path: 'statements/account', component: AccountStatementComponent },
      { path: 'statements/currency', component: CurrencyStatementComponent },
      { path: 'statements/bank-position', component: BankPositionComponent },

      reportRoute('reports/balances', 'correspondentBalances'),
      reportRoute('reports/obligations', 'obligations'),
      reportRoute('reports/foreign-reserve', 'foreignReserve'),
      reportRoute('reports/credit-movements', 'creditMovements'),
      reportRoute('reports/debit-movements', 'debitMovements'),
      reportRoute('reports/resources', 'resources'),

      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'correspondents', component: CorrespondentListComponent },
      { path: 'correspondents/create', component: CorrespondentFormComponent },
      { path: 'correspondents/edit/:id', component: CorrespondentFormComponent },
      { path: 'accounts', component: AccountListComponent },
      { path: 'accounts/create', component: AccountFormComponent },
      { path: 'accounts/edit/:id', component: AccountFormComponent },
      { path: 'banks', component: BankListComponent },
      { path: 'banks/create', component: BankFormComponent },
      { path: 'banks/edit/:id', component: BankFormComponent },
      { path: 'companies', component: CompanyListComponent },
      { path: 'companies/create', component: CompanyFormComponent },
      { path: 'companies/edit/:id', component: CompanyFormComponent },
      { path: 'countries', component: CountryListComponent },
      { path: 'countries/create', component: CountryFormComponent },
      { path: 'countries/edit/:id', component: CountryFormComponent },
      { path: 'resources', component: ResourceListComponent },
      { path: 'resources/create', component: ResourceFormComponent },
      { path: 'resources/edit/:id', component: ResourceFormComponent },
      { path: 'beneficiaries', component: BeneficiaryListComponent },
      { path: 'beneficiaries/create', component: BeneficiaryFormComponent },
      { path: 'beneficiaries/edit/:id', component: BeneficiaryFormComponent },
      { path: 'currencies', component: CurrencyListComponent },
      { path: 'currencies/create', component: CurrencyFormComponent },
      { path: 'currencies/edit/:id', component: CurrencyFormComponent },
      { path: 'obligation-types', component: ObligationTypeListComponent },
      { path: 'obligation-types/create', component: ObligationTypeFormComponent },
      { path: 'obligation-types/edit/:id', component: ObligationTypeFormComponent },
      { path: 'client-types', component: ClientTypeListComponent },
      { path: 'client-types/edit/:id', component: ClientTypeFormComponent },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', canActivate: [homeRedirectGuard], component: HomeRedirectComponent },
];
