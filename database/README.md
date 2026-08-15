# Revenue Usage database deployment

The API uses Dapper and expects its database objects to be deployed independently. Supply the runtime connection string through the `ConnectionStrings__DB_Connection` environment variable or a local, uncommitted configuration provider.

## Deploy

Install Microsoft `sqlcmd`, create an empty `RUTS` database, then run:

```powershell
.\database\deploy.ps1 -Server '.\SQLEXPRESS' -Database RUTS -CreateDatabase -TrustServerCertificate
```

For SQL authentication, also pass `-Username` and `-Password`. The ordered scripts are in `database/deployment`; the final script fails deployment if any API procedure is missing. Take a backup before applying this package to an existing database: it targets the new GUID-based web schema, not the legacy WPF schema.

The deployment runner emits plain `CREATE PROCEDURE` statements for compatibility with older SQL Server versions that do not support `CREATE OR ALTER`. Deploy to a new database; rerunning procedure creation against an already completed database is intentionally not supported.

Run `database/verify-package.ps1` without a database connection to ensure every stored procedure referenced by a Dapper repository has a definition in the package.

The following stored procedures are referenced by the current API and must be added as version-controlled scripts before an environment can be reproduced:

- `dbo.uspCreateTransfer`
- `dbo.uspConfirmTransfer`
- `dbo.uspRejectTransfer`
- `dbo.uspDeleteTransfer`
- `dbo.uspGetCorrespondentAccountStatement`
- `dbo.uspGetFinalBankPosition`
- `dbo.uspGetCurrencyStatement`
- `dbo.uspAddResourceToCorrespondentAccount`
- `dbo.uspDeleteResource`
- `dbo.uspGetResourceStatement`
- `dbo.uspAddObligationPayment`
- `dbo.uspDeleteObligationPayment`
- `dbo.uspGetObligationStatement`
- `dbo.uspGetBeneficiaryStatement`
- Beneficiary master data: `dbo.uspGetBeneficiaries`, `dbo.uspGetBeneficiaryById`, `dbo.uspCreateBeneficiary`, `dbo.uspUpdateBeneficiary`, `dbo.uspDeleteBeneficiary`
- Currency master data: `dbo.uspGetCurrencies`, `dbo.uspGetCurrencyById`, `dbo.uspCreateCurrency`, `dbo.uspUpdateCurrency`, `dbo.uspDeleteCurrency`
- Resource-type master data: `dbo.uspGetResourceTypes`, `dbo.uspGetResourceTypeById`, `dbo.uspCreateResourceType`, `dbo.uspUpdateResourceType`, `dbo.uspDeleteResourceType`
- `dbo.uspGetCurrencyBalances`
- `dbo.uspGetDailyValuation`
- `dbo.uspGetExchangeRate`
- `dbo.uspAddExchangeRate`
- `dbo.uspDeleteExchangeRate`
- `dbo.uspGetCorrespondentBalancesByCurrency`
- `dbo.uspGetTransfers` (implemented in `procedures/uspGetTransfers.sql`)
- Bank, company, and country lookup procedures referenced by `LookupRepository`
- `dbo.uspGetCorrespondents`
- `dbo.uspGetCorrespondentById`
- `dbo.uspCreateCorrespondent`
- `dbo.uspUpdateCorrespondent`
- `dbo.uspDeleteCorrespondent`
- `dbo.uspGetCorrespondentAccounts`
- `dbo.uspGetCorrespondentAccountById`
- `dbo.uspCreateCorrespondentAccount`
- `dbo.uspUpdateCorrespondentAccount`
- `dbo.uspDeleteCorrespondentAccount` (must reject accounts that have movements)
- Coverages: `dbo.uspGetCoverages`, `dbo.uspCreateCoverage`, `dbo.uspDeleteCoverage`
- Deals: `dbo.uspGetDeals`, `dbo.uspCreateDeal`, `dbo.uspDeleteDeal`
- Reserve snapshots: `dbo.uspGetReserveSnapshots`, `dbo.uspCreateReserveSnapshot`, `dbo.uspDeleteReserveSnapshot`
- Obligations: `dbo.uspGetObligations`, `dbo.uspCreateObligation`, `dbo.uspDeleteObligation`, plus the existing statement/payment procedures
- Dashboard/reporting: `dbo.uspGetDashboardSummary`, `dbo.uspGetForeignReserveReport`, `dbo.uspGetObligationReport`

Coverage/deal create and delete procedures must perform their account balance changes in one database transaction. Coverage requires distinct accounts with the same currency; deals require distinct accounts with different currencies and credit the destination with `FromAmount * ExchangeRate`. Both reject insufficient source balance.

`dbo.uspAddObligationPayment` accepts `@CorrespondentAccountId`; it must atomically debit that account and increase the obligation paid total, reject currency mismatches, insufficient account balance, and overpayment. Payment deletion must atomically reverse both effects. An obligation with payments must not be deleted.

Do not commit production credentials or database backups. Scripts should be idempotent where practical and applied in a deterministic order by the deployment pipeline.
