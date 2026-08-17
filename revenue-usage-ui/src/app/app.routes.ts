import { Route, Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';
import { AdminDashboardComponent, UserDashboardComponent } from './features/dashboard/dashboard.component';
import { BankFormComponent, BankListComponent } from './features/banks/bank-pages.component';
import { CompanyFormComponent, CompanyListComponent } from './features/companies/company-pages.component';
import { CountryFormComponent, CountryListComponent } from './features/countries/country-pages.component';
import { TransferListComponent } from './features/transfers/transfer-list.component';
import { API_PAGE_CONFIGS, ApiRoutePageComponent } from './features/api-pages/api-route-page.component';
import {
  AccountFormComponent,
  AccountListComponent,
  BeneficiaryFormComponent,
  BeneficiaryListComponent,
  CurrencyFormComponent,
  CurrencyListComponent,
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

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'app/dashboard' },
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
      { path: 'transfers', component: TransferListComponent },
      apiRoute('obligations', 'obligations'),
      apiRoute('currencies', 'currencies'),
      apiRoute('deals', 'deals'),
      apiRoute('coverages', 'coverages'),
      apiRoute('reserves', 'reserves'),
      apiRoute('reports/balances', 'correspondentBalances'),
      apiRoute('reports/obligations', 'obligationsReport'),
      apiRoute('reports/foreign-reserve', 'foreignReserveReport'),
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
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
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'app/dashboard' },
];
