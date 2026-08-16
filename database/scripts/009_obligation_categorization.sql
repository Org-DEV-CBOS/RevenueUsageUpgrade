/*
Target DB: RUTS_NEW
Adds Bank / Company / Other categorization to obligations.

Table changes (dbo.Obligations):
    ClientType nvarchar(20) NOT NULL DEFAULT 'Other'   -- 'Bank' | 'Company' | 'Other'
    BankId     uniqueidentifier NULL                   -- FK -> dbo.banks (when ClientType = 'Bank')
    CompanyId  uniqueidentifier NULL                   -- FK -> dbo.companies (when ClientType = 'Company')

Modified stored procedures:
    dbo.uspCreateObligation      (+ @ClientType, @BankId, @CompanyId; resolves ClientName from bank/company)
    dbo.uspGetObligations        (+ @ClientType filter; returns ClientType/BankId/CompanyId/BankName/CompanyName)
    dbo.uspGetObligationStatement(returns the same new columns)
    dbo.uspGetObligationReport   (+ @ClientType filter; returns ClientType)

Compatibility: no CREATE OR ALTER, no GO, tolerates a missing dbo.banks / dbo.companies.
*/

SET NOCOUNT ON;

/* =========================
   Columns and constraints
   ========================= */

IF COL_LENGTH('dbo.Obligations', 'ClientType') IS NULL
    EXEC('ALTER TABLE dbo.Obligations ADD ClientType nvarchar(20) NULL;');

IF COL_LENGTH('dbo.Obligations', 'BankId') IS NULL
    EXEC('ALTER TABLE dbo.Obligations ADD BankId uniqueidentifier NULL;');

IF COL_LENGTH('dbo.Obligations', 'CompanyId') IS NULL
    EXEC('ALTER TABLE dbo.Obligations ADD CompanyId uniqueidentifier NULL;');

EXEC('UPDATE dbo.Obligations SET ClientType = ''Other'' WHERE ClientType IS NULL;');

IF NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_Obligations_ClientType')
    EXEC('ALTER TABLE dbo.Obligations ADD CONSTRAINT DF_Obligations_ClientType DEFAULT (''Other'') FOR ClientType;');

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_Obligations_ClientType')
    EXEC('ALTER TABLE dbo.Obligations WITH NOCHECK ADD CONSTRAINT CK_Obligations_ClientType
          CHECK (ClientType IN (''Bank'', ''Company'', ''Other''));');

IF OBJECT_ID('dbo.banks', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Obligations_Banks')
    EXEC('ALTER TABLE dbo.Obligations WITH NOCHECK ADD CONSTRAINT FK_Obligations_Banks
          FOREIGN KEY (BankId) REFERENCES dbo.banks (bankId);');

IF OBJECT_ID('dbo.companies', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Obligations_Companies')
    EXEC('ALTER TABLE dbo.Obligations WITH NOCHECK ADD CONSTRAINT FK_Obligations_Companies
          FOREIGN KEY (CompanyId) REFERENCES dbo.companies (companyId);');

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Obligations_ClientType' AND object_id = OBJECT_ID('dbo.Obligations'))
    EXEC('CREATE INDEX IX_Obligations_ClientType ON dbo.Obligations (ClientType);');

/* =========================
   Stored procedures
   ========================= */

DECLARE @hasBanks bit = CASE WHEN OBJECT_ID('dbo.banks', 'U') IS NULL THEN 0 ELSE 1 END;
DECLARE @hasCompanies bit = CASE WHEN OBJECT_ID('dbo.companies', 'U') IS NULL THEN 0 ELSE 1 END;

DECLARE @bankNameCol nvarchar(200) = CASE WHEN @hasBanks = 1
    THEN N'b.bankNameEn' ELSE N'CAST(NULL AS nvarchar(200))' END;
DECLARE @companyNameCol nvarchar(200) = CASE WHEN @hasCompanies = 1
    THEN N'cm.companyNameEn' ELSE N'CAST(NULL AS nvarchar(200))' END;
DECLARE @bankJoin nvarchar(400) = CASE WHEN @hasBanks = 1
    THEN N'LEFT JOIN dbo.banks b ON b.bankId = o.BankId' ELSE N'' END;
DECLARE @companyJoin nvarchar(400) = CASE WHEN @hasCompanies = 1
    THEN N'LEFT JOIN dbo.companies cm ON cm.companyId = o.CompanyId' ELSE N'' END;

DECLARE @sql nvarchar(max);

/* ---- uspCreateObligation ---- */

IF OBJECT_ID('dbo.uspCreateObligation', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.uspCreateObligation AS BEGIN SET NOCOUNT ON; END');

SET @sql = N'
ALTER PROCEDURE dbo.uspCreateObligation
    @ObligationDate date,
    @ClientName nvarchar(200) = NULL,
    @CurrencyId uniqueidentifier,
    @TotalAmount decimal(19,4),
    @DueDate date = NULL,
    @ReferenceNo nvarchar(100) = NULL,
    @Notes nvarchar(500) = NULL,
    @ClientType nvarchar(20) = ''Other'',
    @BankId uniqueidentifier = NULL,
    @CompanyId uniqueidentifier = NULL,
    @CreatedBy nvarchar(100)
AS
BEGIN
    SET NOCOUNT ON;

    SET @ClientType = ISNULL(NULLIF(LTRIM(RTRIM(@ClientType)), ''''), ''Other'');
    IF @ClientType NOT IN (''Bank'', ''Company'', ''Other'')
        THROW 51010, ''ClientType must be Bank, Company or Other.'', 1;

    IF @ClientType = ''Bank'' AND @BankId IS NULL
        THROW 51011, ''BankId is required when ClientType is Bank.'', 1;
    IF @ClientType = ''Company'' AND @CompanyId IS NULL
        THROW 51012, ''CompanyId is required when ClientType is Company.'', 1;

    IF @ClientType <> ''Bank'' SET @BankId = NULL;
    IF @ClientType <> ''Company'' SET @CompanyId = NULL;
';

IF @hasBanks = 1
    SET @sql += N'
    IF @BankId IS NOT NULL
        SELECT @ClientName = ISNULL(NULLIF(@ClientName, ''''), b.bankNameEn)
        FROM dbo.banks b WHERE b.bankId = @BankId;
';

IF @hasCompanies = 1
    SET @sql += N'
    IF @CompanyId IS NOT NULL
        SELECT @ClientName = ISNULL(NULLIF(@ClientName, ''''), cm.companyNameEn)
        FROM dbo.companies cm WHERE cm.companyId = @CompanyId;
';

SET @sql += N'
    IF NULLIF(LTRIM(RTRIM(ISNULL(@ClientName, ''''))), '''') IS NULL
        THROW 51013, ''ClientName is required.'', 1;

    INSERT dbo.Obligations
        (ObligationDate, ClientName, ClientType, BankId, CompanyId, CurrencyId, TotalAmount, DueDate, ReferenceNo, Notes, CreatedBy)
    OUTPUT inserted.ObligationId
    VALUES
        (@ObligationDate, @ClientName, @ClientType, @BankId, @CompanyId, @CurrencyId, @TotalAmount, @DueDate, @ReferenceNo, @Notes, @CreatedBy);
END;
';

EXEC sp_executesql @sql;

/* ---- uspGetObligations ---- */

IF OBJECT_ID('dbo.uspGetObligations', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.uspGetObligations AS BEGIN SET NOCOUNT ON; END');

SET @sql = N'
ALTER PROCEDURE dbo.uspGetObligations
    @ActiveOnly bit = 1,
    @ClientType nvarchar(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        o.ObligationId,
        o.ObligationDate,
        o.ClientName,
        o.ClientType,
        o.BankId,
        o.CompanyId,
        ' + @bankNameCol + N' AS BankName,
        ' + @companyNameCol + N' AS CompanyName,
        o.CurrencyId,
        c.CurrencyNameAr,
        c.CurrencyNameEn,
        o.TotalAmount,
        o.PaidAmount,
        o.TotalAmount - o.PaidAmount AS RemainingAmount,
        o.DueDate,
        o.ReferenceNo,
        o.Notes,
        o.IsActive
    FROM dbo.Obligations o
    JOIN dbo.Currencies c ON c.CurrencyId = o.CurrencyId
    ' + @bankJoin + N'
    ' + @companyJoin + N'
    WHERE o.DeletedTime IS NULL
      AND (@ActiveOnly = 0 OR o.IsActive = 1)
      AND (@ClientType IS NULL OR o.ClientType = @ClientType)
    ORDER BY o.ObligationDate DESC;
END;
';

EXEC sp_executesql @sql;

/* ---- uspGetObligationStatement ---- */

IF OBJECT_ID('dbo.uspGetObligationStatement', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.uspGetObligationStatement AS BEGIN SET NOCOUNT ON; END');

SET @sql = N'
ALTER PROCEDURE dbo.uspGetObligationStatement
    @ObligationId uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        o.ObligationId,
        o.ObligationDate,
        o.ClientName,
        o.ClientType,
        o.BankId,
        o.CompanyId,
        ' + @bankNameCol + N' AS BankName,
        ' + @companyNameCol + N' AS CompanyName,
        o.CurrencyId,
        c.CurrencyNameAr,
        c.CurrencyNameEn,
        o.TotalAmount,
        o.PaidAmount,
        o.TotalAmount - o.PaidAmount AS RemainingAmount,
        o.DueDate,
        o.ReferenceNo,
        o.Notes,
        o.IsActive
    FROM dbo.Obligations o
    JOIN dbo.Currencies c ON c.CurrencyId = o.CurrencyId
    ' + @bankJoin + N'
    ' + @companyJoin + N'
    WHERE o.ObligationId = @ObligationId
      AND o.DeletedTime IS NULL;

    SELECT
        ObligationPaymentId,
        ObligationId,
        PaymentDate,
        Amount,
        ReferenceNo,
        Notes,
        CreatedBy,
        CreatedTime
    FROM dbo.ObligationPayments
    WHERE ObligationId = @ObligationId
      AND DeletedTime IS NULL
    ORDER BY PaymentDate;
END;
';

EXEC sp_executesql @sql;

/* ---- uspGetObligationReport ---- */

IF OBJECT_ID('dbo.uspGetObligationReport', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.uspGetObligationReport AS BEGIN SET NOCOUNT ON; END');

SET @sql = N'
ALTER PROCEDURE dbo.uspGetObligationReport
    @StartDate date = NULL,
    @EndDate date = NULL,
    @Status nvarchar(20) = NULL,
    @ClientType nvarchar(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        o.ObligationId,
        o.ClientName,
        o.ClientType,
        c.CurrencyCode,
        o.TotalAmount,
        o.PaidAmount,
        o.TotalAmount - o.PaidAmount AS RemainingAmount,
        o.DueDate,
        CASE
            WHEN o.PaidAmount >= o.TotalAmount THEN ''Paid''
            WHEN o.DueDate < CAST(GETUTCDATE() AS date) THEN ''Overdue''
            ELSE ''Open''
        END AS Status
    FROM dbo.Obligations o
    JOIN dbo.Currencies c ON c.CurrencyId = o.CurrencyId
    WHERE o.DeletedTime IS NULL
      AND (@StartDate IS NULL OR o.ObligationDate >= @StartDate)
      AND (@EndDate IS NULL OR o.ObligationDate <= @EndDate)
      AND (@ClientType IS NULL OR o.ClientType = @ClientType)
      AND (@Status IS NULL OR @Status = CASE
            WHEN o.PaidAmount >= o.TotalAmount THEN ''Paid''
            WHEN o.DueDate < CAST(GETUTCDATE() AS date) THEN ''Overdue''
            ELSE ''Open''
        END)
    ORDER BY o.DueDate;
END;
';

EXEC sp_executesql @sql;
