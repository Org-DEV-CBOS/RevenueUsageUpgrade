/*
Target DB: RUTS_NEW
Replaces the free-text obligation client with a lookup-driven client type, and adds an
obligation type that applies to company clients only.

Lookup tables (created here only when missing; the rows below are seeded either way):
    dbo.ClientTypes     -- Bank / Company
    dbo.ObligationTypes -- Letter of credit / Letter of guarantee

Table changes (dbo.Obligations):
    ClientTypeId     uniqueidentifier NOT NULL -- FK -> dbo.ClientTypes
    ObligationTypeId uniqueidentifier NULL     -- FK -> dbo.ObligationTypes, company clients only
    ClientName       dropped -- the client is now the joined bank or company
    ClientType       dropped -- superseded by ClientTypeId

Rules enforced by dbo.uspCreateObligation:
    ClientTypeCode 'BANK'    -> BankId required; CompanyId and ObligationTypeId must be empty
    ClientTypeCode 'COMPANY' -> CompanyId and ObligationTypeId required; BankId must be empty

ClientTypeCode is added here because those rules key off it. An admin can rename or
deactivate a client type, and a rename must not change which branch applies.

Modified stored procedures (deploy from SQL_OBJECTS):
    dbo.uspCreateObligation, dbo.uspGetObligations,
    dbo.uspGetObligationStatement, dbo.uspGetObligationReport
New stored procedures (deploy from SQL_OBJECTS):
    dbo.uspGetClientTypes, dbo.uspUpdateClientType, dbo.uspGetObligationTypes,
    dbo.uspCreateObligationType, dbo.uspUpdateObligationType, dbo.uspDeleteObligationType

Compatibility: no GO, safe to re-run.
*/

SET NOCOUNT ON;

/* =========================
   Lookup tables
   ========================= */

IF OBJECT_ID('dbo.ClientTypes', 'U') IS NULL
    CREATE TABLE dbo.ClientTypes
    (
        ClientTypeId uniqueidentifier NOT NULL CONSTRAINT PK_ClientTypes PRIMARY KEY DEFAULT NEWID(),
        ClientTypeNameEn nvarchar(100) NOT NULL,
        ClientTypeNameAr nvarchar(100) NULL,
        IsActive bit NOT NULL DEFAULT 1
    );

IF OBJECT_ID('dbo.ObligationTypes', 'U') IS NULL
    CREATE TABLE dbo.ObligationTypes
    (
        ObligationTypeId uniqueidentifier NOT NULL CONSTRAINT PK_ObligationTypes PRIMARY KEY DEFAULT NEWID(),
        ObligationTypeNameEn nvarchar(100) NOT NULL,
        ObligationTypeNameAr nvarchar(100) NULL,
        IsActive bit NOT NULL DEFAULT 1
    );

/*
The CRUD procedures soft-delete and stamp an actor, the way the other master-data
lookups do, so both tables need the same audit columns those procedures expect.
*/
IF COL_LENGTH('dbo.ClientTypes', 'ModifiedTime') IS NULL
    EXEC('ALTER TABLE dbo.ClientTypes ADD
              ModifiedTime datetime2 NULL,
              ModifiedBy nvarchar(100) NULL;');

IF COL_LENGTH('dbo.ObligationTypes', 'CreatedTime') IS NULL
    EXEC('ALTER TABLE dbo.ObligationTypes ADD
              CreatedTime datetime2 NOT NULL CONSTRAINT DF_ObligationTypes_CreatedTime DEFAULT SYSUTCDATETIME(),
              CreatedBy nvarchar(100) NULL,
              ModifiedTime datetime2 NULL,
              ModifiedBy nvarchar(100) NULL,
              IsDeleted bit NOT NULL CONSTRAINT DF_ObligationTypes_IsDeleted DEFAULT 0,
              DeletedTime datetime2 NULL,
              DeletedBy nvarchar(100) NULL;');

/*
A stable key for the Bank / Company branch, independent of the display names,
which the admin screens can edit.
*/
IF COL_LENGTH('dbo.ClientTypes', 'ClientTypeCode') IS NULL
    EXEC('ALTER TABLE dbo.ClientTypes ADD ClientTypeCode nvarchar(50) NULL;');

/* =========================
   Seed
   ========================= */

/* Dynamic because ClientTypeCode may have been added by the statement just above. */
EXEC sp_executesql N'
MERGE dbo.ClientTypes AS target
USING (VALUES
    (CAST(''DB12DC1F-577B-44C7-9F35-124870DDAD94'' AS uniqueidentifier), N''BANK'', N''Bank'', N''بنك''),
    (CAST(''9CEDA3BB-FFD3-47EA-8AA1-6575AC966498'' AS uniqueidentifier), N''COMPANY'', N''Company'', N''شركة'')
) AS source (ClientTypeId, ClientTypeCode, ClientTypeNameEn, ClientTypeNameAr)
    ON target.ClientTypeId = source.ClientTypeId
    /* An environment seeded before ClientTypeCode existed matches on the name instead. */
    OR UPPER(LTRIM(RTRIM(target.ClientTypeNameEn))) = source.ClientTypeCode
WHEN MATCHED AND (target.ClientTypeCode IS NULL OR target.ClientTypeCode <> source.ClientTypeCode)
    THEN UPDATE SET ClientTypeCode = source.ClientTypeCode
WHEN NOT MATCHED BY TARGET
    THEN INSERT (ClientTypeId, ClientTypeCode, ClientTypeNameEn, ClientTypeNameAr, IsActive)
         VALUES (source.ClientTypeId, source.ClientTypeCode, source.ClientTypeNameEn, source.ClientTypeNameAr, 1);';

MERGE dbo.ObligationTypes AS target
USING (VALUES
    (CAST('A7DE64A3-44AB-4DF5-BFE5-07CBBC4C2032' AS uniqueidentifier), N'Letter of credit', N'خطاب إعتماد'),
    (CAST('DF89E06A-637A-45EE-B9BE-4635667CC059' AS uniqueidentifier), N'Letter of guarantee', N'خطاب ضمان')
) AS source (ObligationTypeId, ObligationTypeNameEn, ObligationTypeNameAr)
    ON target.ObligationTypeId = source.ObligationTypeId
WHEN NOT MATCHED BY TARGET
    THEN INSERT (ObligationTypeId, ObligationTypeNameEn, ObligationTypeNameAr, IsActive)
         VALUES (source.ObligationTypeId, source.ObligationTypeNameEn, source.ObligationTypeNameAr, 1);

/* Two client types, so a unique code is worth enforcing rather than trusting the seed. */
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_ClientTypes_ClientTypeCode' AND object_id = OBJECT_ID('dbo.ClientTypes'))
    EXEC('CREATE UNIQUE INDEX UX_ClientTypes_ClientTypeCode ON dbo.ClientTypes (ClientTypeCode) WHERE ClientTypeCode IS NOT NULL;');

/* =========================
   Obligations
   ========================= */

IF COL_LENGTH('dbo.Obligations', 'ClientTypeId') IS NULL
    EXEC('ALTER TABLE dbo.Obligations ADD ClientTypeId uniqueidentifier NULL;');

IF COL_LENGTH('dbo.Obligations', 'ObligationTypeId') IS NULL
    EXEC('ALTER TABLE dbo.Obligations ADD ObligationTypeId uniqueidentifier NULL;');

/* Existing rows carry the old ClientType string; map the ones that have an equivalent. */
IF COL_LENGTH('dbo.Obligations', 'ClientType') IS NOT NULL
    EXEC('UPDATE o
          SET ClientTypeId = ct.ClientTypeId
          FROM dbo.Obligations o
          JOIN dbo.ClientTypes ct ON ct.ClientTypeCode = UPPER(LTRIM(RTRIM(o.ClientType)))
          WHERE o.ClientTypeId IS NULL;');

/*
'Other' obligations have no equivalent client type, so they cannot be migrated
automatically. Leave the column nullable until they are resolved by hand, rather
than failing the whole script.
*/
DECLARE @unmapped int = 0;
EXEC sp_executesql
    N'SELECT @count = COUNT(*) FROM dbo.Obligations WHERE ClientTypeId IS NULL AND DeletedTime IS NULL;',
    N'@count int OUTPUT',
    @count = @unmapped OUTPUT;

IF @unmapped > 0
    RAISERROR(
        'dbo.Obligations: %d row(s) have no ClientTypeId and were left as-is. Assign a client type (and a bank or company) to each, then re-run this script to finish the migration.',
        10, 1, @unmapped) WITH NOWAIT;

IF @unmapped = 0
   AND EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Obligations') AND name = 'ClientTypeId' AND is_nullable = 1)
    EXEC('ALTER TABLE dbo.Obligations ALTER COLUMN ClientTypeId uniqueidentifier NOT NULL;');

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Obligations_ClientTypes')
    EXEC('ALTER TABLE dbo.Obligations WITH NOCHECK ADD CONSTRAINT FK_Obligations_ClientTypes
          FOREIGN KEY (ClientTypeId) REFERENCES dbo.ClientTypes (ClientTypeId);');

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Obligations_ObligationTypes')
    EXEC('ALTER TABLE dbo.Obligations WITH NOCHECK ADD CONSTRAINT FK_Obligations_ObligationTypes
          FOREIGN KEY (ObligationTypeId) REFERENCES dbo.ObligationTypes (ObligationTypeId);');

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Obligations_ClientTypeId' AND object_id = OBJECT_ID('dbo.Obligations'))
    EXEC('CREATE INDEX IX_Obligations_ClientTypeId ON dbo.Obligations (ClientTypeId);');

/* =========================
   Retire the old client columns
   ========================= */

/*
Only once every obligation has a ClientTypeId, so an unmigrated 'Other' row does not
lose the only record of who its client was.
*/
IF @unmapped = 0
BEGIN
    IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Obligations_ClientType' AND object_id = OBJECT_ID('dbo.Obligations'))
        EXEC('DROP INDEX IX_Obligations_ClientType ON dbo.Obligations;');

    IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_Obligations_ClientType')
        EXEC('ALTER TABLE dbo.Obligations DROP CONSTRAINT CK_Obligations_ClientType;');

    IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_Obligations_ClientType')
        EXEC('ALTER TABLE dbo.Obligations DROP CONSTRAINT DF_Obligations_ClientType;');

    IF COL_LENGTH('dbo.Obligations', 'ClientType') IS NOT NULL
        EXEC('ALTER TABLE dbo.Obligations DROP COLUMN ClientType;');

    /*
    The constraint name is generated, so it has to be looked up. EXEC() takes only
    literals and variables, hence the whole statement is built up front.
    */
    DECLARE @dropClientNameDefault nvarchar(max) = (
        SELECT N'ALTER TABLE dbo.Obligations DROP CONSTRAINT ' + QUOTENAME(dc.name) + N';'
        FROM sys.default_constraints dc
        JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID('dbo.Obligations') AND c.name = 'ClientName');

    IF @dropClientNameDefault IS NOT NULL
        EXEC sp_executesql @dropClientNameDefault;

    IF COL_LENGTH('dbo.Obligations', 'ClientName') IS NOT NULL
        EXEC('ALTER TABLE dbo.Obligations DROP COLUMN ClientName;');
END;
