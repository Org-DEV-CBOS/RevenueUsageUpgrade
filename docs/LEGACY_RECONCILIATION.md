# Legacy reconciliation and verification

## Scope

This report reconciles the legacy `RUTS` WPF application with the root ASP.NET Core API and the Angular application in `Revenue-Usage-UI-RUTS`. Authentication and password-management differences are intentionally excluded from this phase.

## Feature coverage

| Legacy capability | API | Angular UI | Reconciliation result |
|---|---|---|---|
| Correspondents and accounts | CRUD and movement-aware delete contracts | Live account selectors and reference-data service | Covered; requires SQL procedures |
| Beneficiaries | CRUD and beneficiary statement | Live transfer selector and statement screen | Covered; requires SQL procedures |
| Currencies and exchange rates | Master CRUD, balances, valuation, FX rates | Live selectors, balances and FX dialog | Covered; requires SQL procedures |
| Resource types and resource transactions | Master CRUD, add/delete/statement | Live type/account/currency selectors | Covered; requires SQL procedures |
| Transfers | Create, list/filter, confirm, reject, delete and statements | List/filter/create/confirm/reject/delete | Partially blocked by unresolved operation-type, usage-type and bank lookup contracts |
| Same-currency covers | List/create/delete | Account-constrained create and statement list | Covered; balance changes must be atomic in SQL |
| Cross-currency deals | List/create/delete | Currency-constrained account selectors and deal list | Covered; balance changes must be atomic in SQL |
| Reserve snapshots | List/create/delete | Reserve entry and history screen | Covered; requires SQL procedures |
| Obligations | List/create/delete, payment/delete payment, statement | Create/list and payment with funding-account selection | Covered; debit/payment changes must be atomic in SQL |
| Dashboard | Consolidated as-of-date summary plus balance/valuation feeds | KPIs, balance chart, valuation chart and recent transfers | Covered; requires SQL procedures |
| Reports | Account statement, bank position, currency, foreign reserve and obligations | Filtered tables and Excel export | Core reports covered; aggregate resource/movement reports and PDF export remain optional parity gaps |

## UI location audit

All new Angular components, templates, services, routes and translations are under `Revenue-Usage-UI-RUTS`. No Angular implementation files were found in the root API projects. The `RUTS` directory remains the original WPF application.

## Executable verification

- ASP.NET solution builds with zero warnings.
- Application validator and API route-contract suite passes (25 tests at the time of this reconciliation).
- Angular production build passes.
- Angular template compilation validates UI bindings and service payload types.
- API startup smoke testing is not available on this workstation because only .NET 9/10 runtimes are installed for a net8 application. Build/test execution uses major-version roll-forward.

## Database deployment gate

The infrastructure layer references 61 `dbo.usp*` procedures. Definitions for all 61 are now included in the ordered package under `database/deployment` and `database/procedures`; `database/verify-package.ps1` validates static contract coverage. The package still requires deployment to SQL Server and database-backed integration testing.

Do not declare production end-to-end parity until:

1. Every referenced procedure has an idempotent, reviewed SQL script.
2. The scripts are deployed to a disposable SQL Server database.
3. Seed data supplies currencies, correspondents/accounts, beneficiaries, resource types, operation types, usage types and banks.
4. API integration tests exercise create/reverse flows and verify balances before and after transfers, covers, deals and obligation payments.
5. Report totals are reconciled against the same legacy database snapshot.

## Remaining blockers

- Transfer creation still supplies placeholder GUIDs for operation type, usage type and bank because no corresponding lookup contract exists. Add those master-data endpoints or make the create procedure resolve stable business codes server-side.
- Deployment of the procedure package to a disposable SQL Server and database-backed integration testing remain required.
- Aggregate resource/credit/debit reports and PDF export remain lower-priority legacy parity items.
