# Revenue Usage UI

Angular frontend for the **RevenueUsage** API, styled after the RUTS desktop app with bilingual **English / Arabic** support.

No authentication is configured yet — OIDC will be added later.

## Run

```bash
# Terminal 1 — API
cd ../RevenuUsage.API
dotnet run

# Terminal 2 — UI
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200) — lands on **UserLayout** dashboard. Admin screens at `/admin/*`.

## Layouts

| Route prefix | Layout | Modules |
|--------------|--------|---------|
| `/app/*` | UserLayout | Dashboard, accounts, transfers, obligations, currencies, deals, coverages, reserves, reports |
| `/admin/*` | AdminLayout | Banks, companies, countries, correspondents, accounts, resources, beneficiaries, currencies |

## Linked API endpoints

All controllers are wired in `src/app/core/services/api.service.ts`:

| Service | Endpoints |
|---------|-----------|
| `LookupsApiService` | banks, companies, countries CRUD |
| `CorrespondentsApiService` | correspondents CRUD |
| `CorrespondentAccountsApiService` | correspondent accounts CRUD |
| `BeneficiariesApiService` | beneficiaries CRUD + transfers statement |
| `CurrenciesApiService` | currencies CRUD, balances, daily valuation, exchange rates, correspondent balances |
| `TransfersApiService` | transfers CRUD, confirm/reject, statements |
| `ObligationsApiService` | obligations CRUD, payments, statement |
| `ResourcesApiService` | resource types CRUD, add resource, statement, delete |
| `DealsApiService` | deals list/create/delete |
| `CoveragesApiService` | coverages list/create/delete |
| `ReservesApiService` | reserves list/create/delete |
| `ReportsApiService` | dashboard, foreign reserve, obligations report |
| `HealthApiService` | `/HealthCheck` |

## Environments

| Command | Config file | API |
|---------|-------------|-----|
| `npm start` | `environment.ts` | local `https://localhost:7068/api` |
| `npm run start:staging` | `environment.staging.ts` | `https://dev-staging.cbos.gov.sd/RUTS-Api/api` |
| `npm run build:staging` | `environment.staging.ts` | same staging API, output in `dist/` (`base href` `/RUTS/`) |
| `npm run build` | `environment.production.ts` | production |

Staging is hosted at `https://dev-staging.cbos.gov.sd/RUTS/`. After `npm run build:staging`, copy the contents of `dist/revenue-usage-ui/browser/` into the IIS `RUTS` application (include `web.config`). IIS needs the URL Rewrite module.
