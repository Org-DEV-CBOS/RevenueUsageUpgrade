# RevenueUsage Backend — Missing Features & Endpoints

## Purpose

`RUTS` is the existing WPF desktop application used by CBOS staff today. It has **no REST API of its own** — it talks directly to SQL Server via Entity Framework Core repositories and a Unit of Work (`Repositories\Unitofwork.cs`, `Repositories\RepositoryBase.cs` in the `RUTS` repo). Those repositories, together with the ViewModels/Views that call them, define the **full set of business capabilities** currently in production use.

`RevenuUsage` (this repo) is the new ASP.NET Core Clean Architecture backend (Controllers → MediatR CQRS handlers → Dapper repositories → stored procedures) intended to expose this functionality over HTTP for a future Angular client.

This document compares the two side by side, feature area by feature area, to track what still needs to be built in `RevenuUsage` before it can fully replace RUTS's data layer.

**How to read the tables:** each row is one capability. *RUTS behavior* cites the source repository/class in the `RUTS` repo. *RevenueUsage status* cites the controller/endpoint (or lack thereof) in this repo. *Gap* summarizes what's missing. *Priority* is a rough suggestion (High = blocks core workflows or is a hard dependency of other endpoints; Medium = important but not blocking; Low = nice-to-have / export-only).

Endpoint inventory used for comparison: 7 controllers / ~35 actions in `RevenuUsage.API\Controllers` (`TransferController`, `ResourcesController`, `ObligationsController`, `CurrenciesController`, `BeneficiariesController`, `LookupsController`, `RevenueUsageController`).

---

## 1. Authentication & Users — **Missing entirely**

| Feature | What RUTS does | RevenueUsage coverage | Gap | Priority |
|---|---|---|---|---|
| Login | Authenticates by employee number + password against the `Users` table (`Authentication\AuthenticateUser.cs:23-27`); routes to Employee vs Admin shell based on `Role` (`ViewModel\LoginViewModel.cs:116-123`) | None — no `AuthController`, no login endpoint anywhere in `RevenuUsage.API` | No way for a client to authenticate at all | High |
| User CRUD | Create/edit/soft-delete employee/admin users (`Repositories\UserRepository.cs`: `Exists` L40, `Update` L58) | None | No user-management endpoints | High |
| Password reset (self & admin-initiated) | `UserRepository.ResetPassword` L46, `CheckPassword` L53; separate self-service vs admin views | None | No reset-password endpoint | Medium |
| Role-based authorization (Employee / Admin / Super Admin) | Enforced client-side by which shell/menu loads (`Layout.xaml.cs`, `AdminLayout.xaml.cs`) | None — `launchSettings.json` has `anonymousAuthentication: true`, no `[Authorize]` attributes anywhere in `RevenuUsage.API` | No auth/authorization middleware or role checks | High |

Everything else below assumes this gap will eventually be closed, since every write endpoint in RevenueUsage currently accepts a free-text `CreatedBy`/`ModifiedBy`/`DeletedBy` string in the request body instead of deriving identity from an authenticated principal.

---

## 2. Correspondents (master data) — **Missing entirely**

| Feature | What RUTS does | RevenueUsage coverage | Gap | Priority |
|---|---|---|---|---|
| Correspondent CRUD | Create/edit correspondent banks with Name, Code, Country (`Repositories\CorrespondentRepository.cs`: `Update` L65, `Exists` L23) | None — no `CorrespondentsController` | Can't create/manage correspondents at all | High |
| Correspondent combo/lookup data | `GetComboData` L29, `GetCorrespondentsWithAccountsComboData` L39, `GetCorrespondentName` L57 | None | No lookup endpoint for correspondents | High |

Note: RevenueUsage's `TransferController`, `ResourcesController`, and `CurrenciesController` all reference a `CorrespondentAccountId` as an input parameter, but there is no endpoint anywhere to create, list, or manage the correspondents or accounts those IDs point to. This is the most foundational gap — it blocks meaningful use of nearly every existing endpoint from a fresh database.

---

## 3. Correspondent Accounts (master data) — **Missing entirely**

| Feature | What RUTS does | RevenueUsage coverage | Gap | Priority |
|---|---|---|---|---|
| Account CRUD | Create/edit accounts per correspondent + currency (`Repositories\AccountRepository.cs`: `GetAll` L27, `Update` L77) | None — no `AccountsController` | No way to create/manage correspondent accounts | High |
| Account existence / movement checks | `Exists` L67, `HasMovements` L72 (used to guard delete) | None | No equivalent validation endpoint | Medium |
| Account balance | Tracked on the `Account` entity, updated by transactions/covers/deals | Read indirectly via statements/valuation only | No direct "get account" or "get balance" endpoint | Medium |

---

## 4. Beneficiaries (master data) — **Read-only in RevenueUsage**

| Feature | What RUTS does | RevenueUsage coverage | Gap | Priority |
|---|---|---|---|---|
| Create/edit beneficiary | `Repositories\BeneficariesRepository.cs`: `Update` L36 | None | No create/update endpoint | Medium |
| List/combo beneficiaries | `GetComboData` L22, `GetBeneficaryName` L29 | None | No list/lookup endpoint | Medium |
| Beneficiary exists check | `Exists` L42 | None | — | Low |
| Beneficiary statement (transfers) | Implicit via transaction history filtered by beneficiary | `BeneficiariesController.GetBeneficiaryStatement` (`GET api/Beneficiaries/{beneficiaryId}/transfers`) | Covered (read-only) | — |

---

## 5. Currencies (master data) — **Partially covered**

| Feature | What RUTS does | RevenueUsage coverage | Gap | Priority |
|---|---|---|---|---|
| Currency CRUD (code, EN/short names) | `Repositories\CurrencyRepository.cs`: `Update` L119, `Exists` L125 | None — `CurrenciesController` has no create/update/delete for currency master records | No currency master-data CRUD | Medium |
| Currency list / combo / by-correspondent | `GetAllCurrencies` L25, `GetComboData` L50, `GetAvailableCurrencies` L69, `GetComboDataByCorrespondent` L89 | None | No "list currencies" endpoint | Medium |
| Currency balances | — | `GET api/Currencies/balances` | Covered (and arguably ahead of RUTS) | — |
| Correspondent balances by currency | — | `GET api/Currencies/correspondent-balances` | Covered | — |
| Daily valuation (cash/gold in USD) | Reserve reports | `GET api/Currencies/daily-valuation` | Covered (read) | — |
| Exchange rates (get/add/delete) | Rates read from `ExchangeRates` table, populated externally, only consumed via reports (`Report.GetRateFor`/`GetRateByIdFor` L507-528) | `GET/POST api/Currencies/exchange-rates`, `DELETE api/Currencies/exchange-rates/{id}` | **RevenueUsage is ahead of RUTS here** — full CRUD exists where RUTS only reads | — (covered / exceeded) |

---

## 6. Resource Items (master data / categories) — **Missing entirely**

| Feature | What RUTS does | RevenueUsage coverage | Gap | Priority |
|---|---|---|---|---|
| Resource item CRUD | Create/edit resource categories used to classify credit transactions (`Repositories\ResourceItemRepository.cs`: `Update` L43) | None | `ResourcesController` only manages resource *transactions* (`AddResourceToCorrespondentAccount`, `GetResourceStatement`, `DeleteResource`) against a `ResourceTypeId` — there's no endpoint to create/list/edit the resource type/category master list itself | Medium |
| Resource item list/combo | `GetComboData` L27, `GetResourceName` L35 | None | No lookup endpoint for `ResourceTypeId` values | Medium |

---

## 7. Transactions / Transfers — **Mostly covered, some gaps**

| Feature | What RUTS does | RevenueUsage coverage | Gap | Priority |
|---|---|---|---|---|
| Create transaction (Credit/Debit) | `CreateTransactionViewModel`; `TransactionRepository.Update` L27 | `POST api/Transfer` (`TransferController.CreateTransfer`) | Roughly parallel; RevenueUsage transfer model doesn't explicitly surface a Credit/Debit "Type" the way RUTS does (relies on `OperationTypeId`/`ResourceTypeId`/`UsageTypeId` instead) — verify these map 1:1 to RUTS's Credit/Debit semantics | Low (naming/parity check) |
| Confirm transaction | `SuperTransactionViewModel` ~L498-516 (updates account balances) | `PUT api/Transfer/ConfirmTransfer` | Covered | — |
| Reject transaction | Not an explicit RUTS concept (soft-delete instead) | `PUT api/Transfer/RejectTransfer` | RevenueUsage is ahead here | — |
| Delete/soft-delete transaction | Soft delete via `Deleted_at` | `DELETE api/Transfer/{transferId}` | Covered | — |
| List/filter transactions (pending vs completed) | `TransactionsViewModel` splits pending (`StatementDate == null`) vs completed lists, with paging/filtering | None — no `GET` list endpoint for transfers, only statement/report-style reads | No generic "list transfers with filters" endpoint (only per-account/per-currency statements exist) | Medium |
| Account statement | Implicit from transaction list per account | `GET api/Transfer/Statement/GetCorrespondentAccountStatement` | Covered | — |
| Currency statement | `Report.GetCurrenciesData` | `GET api/Transfer/Statement/GetCurrencyStatement` | Covered | — |
| Final bank position | `Report.GetForeignReserveReport` (approx.) | `GET api/Transfer/Statement/GetFinalBankPosition` | Covered | — |

---

## 8. Covers / Replenishments — **Missing entirely**

| Feature | What RUTS does | RevenueUsage coverage | Gap | Priority |
|---|---|---|---|---|
| Create cover (transfer between two correspondent accounts) | `CreateCoverViewModel`: `UpdateAcccount` L191, `AddCovering` L201, `ExecuteSaveCommand` L207; updates both account balances | None | No equivalent command/endpoint anywhere in `RevenuUsage` | High |
| List covers | `Repositories\CoveringRepositories.cs`: `GetAllCoverings` L26 | None | No listing endpoint | Medium |
| Validate accounts for cover | `CheckAccounts` L106 | None | — | Low |
| Delete cover (with re-validation) | `ChecktoDelete` L130, `Update` L173 | None | — | Medium |

---

## 9. Dealing (FX transfer between accounts) — **Missing entirely**

| Feature | What RUTS does | RevenueUsage coverage | Gap | Priority |
|---|---|---|---|---|
| Create deal (FX transfer with exchange rate) | `Repositories\DealRepository.cs`: `GetAllDeals` L25, `CheckAccounts` L90, `Update` L179 | None | No `DealingController`/equivalent commands | High |
| List/delete deals | `ChecktoDelete` L115, `GetComboData` L157 | None | — | Medium |

---

## 10. Reserves (Gold / Cash / Deposits) — **Read-only in RevenueUsage**

| Feature | What RUTS does | RevenueUsage coverage | Gap | Priority |
|---|---|---|---|---|
| Enter reserve stats (Gold, CashInHand, Deposits) | `Reserve\CreateViewModel` → `ReserveRepository` (base CRUD `Add`) | None — `CurrenciesController.GetDailyValuation` only **reads** cash/gold figures | No POST/create endpoint to record new reserve entries | High |
| Latest reserve stats | `Dashboard.GetStats` L116-120 | Partially via `GET api/Currencies/daily-valuation` | Read side roughly covered; write side missing | — |

---

## 11. Obligations — **Payments covered, creation missing**

| Feature | What RUTS does | RevenueUsage coverage | Gap | Priority |
|---|---|---|---|---|
| Create obligation (Bank / Company / Other) | `CreateObligationViewModel`; `Repositories\ObligationRepository.cs`: `GetRate` L18, `Update` L24 | None — `ObligationsController` only has payment/statement endpoints | No "create obligation" endpoint; obligations must already exist to record a payment against them, and the obligations table isn't even defined in this codebase's schema (only referenced via stored procs) | High |
| Add installment/payment | `InstallmentViewModel.ExecuteSaveCommand` L33-69 | `POST api/Obligations/payment` | Covered | — |
| Delete payment | Soft delete | `DELETE api/Obligations/payment/{obligationPaymentId}` | Covered | — |
| Obligation statement (details + payments) | `Report.GetBanksObligationData` L367, `GetOthersObligationData` L415, `GetCompaniesObligationData` L461 | `GET api/Obligations/statement/{obligationId}` | Covered for a single obligation; no aggregate "list all obligations by type" endpoint | Medium |

---

## 12. Dashboard Analytics — **Missing entirely**

| Feature | What RUTS does | RevenueUsage coverage | Gap | Priority |
|---|---|---|---|---|
| Monthly debit bar chart | `Repositories\Dashboard.cs`: `GetBarChartData` L33-72 | None | No analytics endpoint | Medium |
| Credit-by-resource pie chart | `GetPieChartData` L80-115 | None | — | Medium |
| Correspondents balance widget | `GetCorrespondentsBallance` L74-78 | Roughly covered by `GET api/Currencies/correspondent-balances` | Overlaps with an existing endpoint — may not need a dedicated dashboard route | Low |
| Latest stats summary (Gold/Cash/Deposits) | `GetStats` L116-120 | Roughly covered by `GET api/Currencies/daily-valuation` | Overlaps | Low |

---

## 13. Reports & Export — **Partially covered, no export**

| Feature | What RUTS does | RevenueUsage coverage | Gap | Priority |
|---|---|---|---|---|
| Correspondents balance report (multi-currency) | `Report.GetCorrespondentCurrenciesTotal` L31-131 | `GET api/Currencies/correspondent-balances` (approx.) | Roughly covered; verify column/field parity | Low |
| Foreign reserve report | `Report.GetForeignReserveReport` L189+ | `GET api/Transfer/Statement/GetFinalBankPosition`, `GET api/Currencies/daily-valuation` (approx.) | Roughly covered; verify parity | Low |
| Resources report | `Report.GetResourcesReport` L307 | `GET api/Resources/statement/{correspondentAccountId}` is per-account only | No aggregate cross-account resources report | Medium |
| Credit/Debit movement reports | `Report.GetCreditMovements` L318, `GetDebitMovements` L343 | Approximated by account/currency statements | No dedicated movement-list report across accounts | Medium |
| Obligations report (Banks/Companies/Others breakdown) | `Report.GetBanksObligationData` L367, `GetOthersObligationData` L415, `GetCompaniesObligationData` L461 | Only single-obligation statement exists | No aggregate obligations report by party type | Medium |
| PDF export | `View\Reports\*.xaml.cs`: `ExportToPdf` (CorrespondentsBalance L122, ForeignReserve L57, ObligationsReport L160) | None | No export/download endpoints of any kind | Low |
| Excel export | Same views: `ExportToExcel` (L253, L239, L339) | None | — | Low |

---

## 14. Already covered / no action needed

These areas already have parity (or better) in RevenueUsage and require no immediate work:

| Feature | RUTS | RevenueUsage |
|---|---|---|
| Banks (remitting banks) CRUD | `Repositories\BanksRepository.cs` (GetComboData, Update, Exists) | Full CRUD: `GET/POST/PUT/DELETE api/Lookups/banks[/{id}]` |
| Companies CRUD | `Repositories\CompanyRepository.cs` | Full CRUD: `GET/POST/PUT/DELETE api/Lookups/companies[/{id}]` |
| Countries | Not a distinct master-data screen in RUTS (Country is just a field on Correspondent) | Full CRUD: `GET/POST/PUT/DELETE api/Lookups/countries[/{id}]` — a RevenueUsage addition beyond RUTS's scope, not a gap |
| Exchange rates | Read-only, populated externally into the `ExchangeRates` table | Full CRUD: `GET/POST/DELETE api/Currencies/exchange-rates` — RevenueUsage exceeds RUTS here |
| Beneficiary statement (read) | Implicit via transaction filtering | `GET api/Beneficiaries/{beneficiaryId}/transfers` |
| Health check | N/A (desktop app) | `GET api/RevenueUsage/HealthCheck` |

---

## Summary by priority

**High priority (blocking / foundational):**
- Authentication & user management (Section 1)
- Correspondents master data (Section 2)
- Correspondent Accounts master data (Section 3)
- Covers / Replenishments (Section 8)
- Dealing / FX transfers (Section 9)
- Reserve entry (create Gold/Cash/Deposits) (Section 10)
- Obligation creation (Section 11)

**Medium priority:**
- Beneficiary create/update/list (Section 4)
- Currency master-data CRUD (Section 5)
- Resource item master data (Section 6)
- Transaction list/filter endpoint (Section 7)
- Covers listing/delete (Section 8)
- Dealing listing/delete (Section 9)
- Aggregate obligations report (Section 11, 13)
- Dashboard bar/pie chart data (Section 12)
- Resources & movement reports (Section 13)

**Low priority:**
- Naming/semantic parity checks (Credit/Debit typing)
- Dashboard widgets that already overlap existing endpoints
- PDF/Excel export endpoints

**Note on unused code in RevenueUsage:** `RevenuUsage.Application\Features\RevenueUsages` (`RecordRevenueUsage` command, `GetRevenueUsageById` query, backed by an in-memory repository) has no controller wiring it to HTTP and does not correspond to any RUTS feature — it appears to be leftover scaffolding from the initial CQRS setup and is out of scope for this comparison.
