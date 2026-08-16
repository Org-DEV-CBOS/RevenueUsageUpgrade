/*
Target DB: RUTS_NEW
Compatibility script:
- avoids CREATE OR ALTER
- avoids GO
- tolerates schema differences for OperationTypes / UsageTypes
*/

SET NOCOUNT ON;

/* =========================
   Operation Types (tolerant)
   ========================= */

IF OBJECT_ID('dbo.uspGetOperationTypes', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.uspGetOperationTypes AS BEGIN SET NOCOUNT ON; END');
EXEC(N'
ALTER PROCEDURE dbo.uspGetOperationTypes
    @ActiveOnly bit = 1
AS
BEGIN
    DECLARE @hasNameAr bit = CASE WHEN COL_LENGTH(''dbo.OperationTypes'', ''OperationTypeNameAr'') IS NULL THEN 0 ELSE 1 END;
    DECLARE @hasIsActive bit = CASE WHEN COL_LENGTH(''dbo.OperationTypes'', ''IsActive'') IS NULL THEN 0 ELSE 1 END;
    DECLARE @hasIsDeleted bit = CASE WHEN COL_LENGTH(''dbo.OperationTypes'', ''IsDeleted'') IS NULL THEN 0 ELSE 1 END;
    DECLARE @hasTransferDeleted bit = CASE WHEN COL_LENGTH(''dbo.Transfers'', ''DeletedTime'') IS NULL THEN 0 ELSE 1 END;

    DECLARE @sql nvarchar(max) = N''SELECT
        OperationTypeId,
        OperationTypeCode,
        OperationTypeNameEn,
        '' + CASE WHEN @hasNameAr = 1 THEN N''OperationTypeNameAr'' ELSE N''CAST(NULL AS nvarchar(100)) AS OperationTypeNameAr'' END + N'',
        '' + CASE WHEN @hasIsActive = 1 THEN N''IsActive'' ELSE N''CAST(1 AS bit) AS IsActive'' END + N'',
        CAST(CASE WHEN EXISTS (
            SELECT 1 FROM dbo.Transfers t
            WHERE t.OperationTypeId = ot.OperationTypeId '' + CASE WHEN @hasTransferDeleted = 1 THEN N''AND t.DeletedTime IS NULL'' ELSE N'''' END + N''
        ) THEN 1 ELSE 0 END AS bit) AS HasMovements
    FROM dbo.OperationTypes ot
    WHERE 1=1 ''
    + CASE WHEN @hasIsDeleted = 1 THEN N'' AND IsDeleted = 0'' ELSE N'''' END
    + CASE WHEN @hasIsActive = 1 THEN N'' AND (@ActiveOnly = 0 OR IsActive = 1)'' ELSE N'''' END
    + N'' ORDER BY OperationTypeNameEn'';

    EXEC sp_executesql @sql, N''@ActiveOnly bit'', @ActiveOnly;
END;
');

IF OBJECT_ID('dbo.uspCreateOperationType', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.uspCreateOperationType AS BEGIN SET NOCOUNT ON; END');
EXEC(N'
ALTER PROCEDURE dbo.uspCreateOperationType
    @OperationTypeCode nvarchar(50),
    @OperationTypeNameEn nvarchar(100),
    @OperationTypeNameAr nvarchar(100) = NULL,
    @CreatedBy nvarchar(100) = NULL
AS
BEGIN
    DECLARE @hasNameAr bit = CASE WHEN COL_LENGTH(''dbo.OperationTypes'', ''OperationTypeNameAr'') IS NULL THEN 0 ELSE 1 END;
    DECLARE @hasCreatedBy bit = CASE WHEN COL_LENGTH(''dbo.OperationTypes'', ''CreatedBy'') IS NULL THEN 0 ELSE 1 END;

    DECLARE @cols nvarchar(max) = N''OperationTypeCode, OperationTypeNameEn'';
    DECLARE @vals nvarchar(max) = N''@OperationTypeCode, @OperationTypeNameEn'';
    IF @hasNameAr = 1 BEGIN SET @cols += N'', OperationTypeNameAr''; SET @vals += N'', @OperationTypeNameAr''; END;
    IF @hasCreatedBy = 1 BEGIN SET @cols += N'', CreatedBy''; SET @vals += N'', @CreatedBy''; END;

    DECLARE @sql nvarchar(max) = N''INSERT dbo.OperationTypes ('' + @cols + N'') OUTPUT inserted.OperationTypeId VALUES ('' + @vals + N'');'';
    EXEC sp_executesql @sql,
        N''@OperationTypeCode nvarchar(50), @OperationTypeNameEn nvarchar(100), @OperationTypeNameAr nvarchar(100), @CreatedBy nvarchar(100)'',
        @OperationTypeCode, @OperationTypeNameEn, @OperationTypeNameAr, @CreatedBy;
END;
');

IF OBJECT_ID('dbo.uspUpdateOperationType', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.uspUpdateOperationType AS BEGIN SET NOCOUNT ON; END');
EXEC(N'
ALTER PROCEDURE dbo.uspUpdateOperationType
    @OperationTypeId uniqueidentifier,
    @OperationTypeCode nvarchar(50),
    @OperationTypeNameEn nvarchar(100),
    @OperationTypeNameAr nvarchar(100) = NULL,
    @IsActive bit,
    @ModifiedBy nvarchar(100) = NULL
AS
BEGIN
    DECLARE @hasNameAr bit = CASE WHEN COL_LENGTH(''dbo.OperationTypes'', ''OperationTypeNameAr'') IS NULL THEN 0 ELSE 1 END;
    DECLARE @hasIsActive bit = CASE WHEN COL_LENGTH(''dbo.OperationTypes'', ''IsActive'') IS NULL THEN 0 ELSE 1 END;
    DECLARE @hasIsDeleted bit = CASE WHEN COL_LENGTH(''dbo.OperationTypes'', ''IsDeleted'') IS NULL THEN 0 ELSE 1 END;

    DECLARE @set nvarchar(max) = N''OperationTypeCode=@OperationTypeCode, OperationTypeNameEn=@OperationTypeNameEn'';
    IF @hasNameAr = 1 SET @set += N'', OperationTypeNameAr=@OperationTypeNameAr'';
    IF @hasIsActive = 1 SET @set += N'', IsActive=@IsActive'';

    DECLARE @sql nvarchar(max) = N''UPDATE dbo.OperationTypes SET '' + @set + N'' WHERE OperationTypeId=@OperationTypeId''
        + CASE WHEN @hasIsDeleted = 1 THEN N'' AND IsDeleted=0'' ELSE N'''' END;

    EXEC sp_executesql @sql,
        N''@OperationTypeId uniqueidentifier,@OperationTypeCode nvarchar(50),@OperationTypeNameEn nvarchar(100),@OperationTypeNameAr nvarchar(100),@IsActive bit'',
        @OperationTypeId,@OperationTypeCode,@OperationTypeNameEn,@OperationTypeNameAr,@IsActive;
END;
');

IF OBJECT_ID('dbo.uspDeleteOperationType', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.uspDeleteOperationType AS BEGIN SET NOCOUNT ON; END');
EXEC(N'
ALTER PROCEDURE dbo.uspDeleteOperationType
    @OperationTypeId uniqueidentifier,
    @DeletedBy nvarchar(100) = NULL
AS
BEGIN
    DECLARE @hasTransferDeleted bit = CASE WHEN COL_LENGTH(''dbo.Transfers'', ''DeletedTime'') IS NULL THEN 0 ELSE 1 END;
    DECLARE @hasIsDeleted bit = CASE WHEN COL_LENGTH(''dbo.OperationTypes'', ''IsDeleted'') IS NULL THEN 0 ELSE 1 END;
    DECLARE @hasIsActive bit = CASE WHEN COL_LENGTH(''dbo.OperationTypes'', ''IsActive'') IS NULL THEN 0 ELSE 1 END;

    DECLARE @checkSql nvarchar(max) = N''IF EXISTS (SELECT 1 FROM dbo.Transfers WHERE OperationTypeId=@OperationTypeId ''
        + CASE WHEN @hasTransferDeleted = 1 THEN N''AND DeletedTime IS NULL'' ELSE N'''' END + N'')
        THROW 51004, ''''Operation type has movements.'''', 1;'';
    EXEC sp_executesql @checkSql, N''@OperationTypeId uniqueidentifier'', @OperationTypeId;

    IF @hasIsDeleted = 1
    BEGIN
        DECLARE @set nvarchar(max) = N''IsDeleted=1'';
        IF @hasIsActive = 1 SET @set += N'', IsActive=0'';
        DECLARE @sql nvarchar(max) = N''UPDATE dbo.OperationTypes SET '' + @set + N'' WHERE OperationTypeId=@OperationTypeId'';
        EXEC sp_executesql @sql, N''@OperationTypeId uniqueidentifier'', @OperationTypeId;
    END
    ELSE
        DELETE FROM dbo.OperationTypes WHERE OperationTypeId=@OperationTypeId;
END;
');

/* =====================
   Usage Types (tolerant)
   ===================== */

IF OBJECT_ID('dbo.uspGetUsageTypes', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.uspGetUsageTypes AS BEGIN SET NOCOUNT ON; END');
EXEC(N'
ALTER PROCEDURE dbo.uspGetUsageTypes
    @ActiveOnly bit = 1
AS
BEGIN
    DECLARE @hasNameAr bit = CASE WHEN COL_LENGTH(''dbo.UsageTypes'', ''UsageTypeNameAr'') IS NULL THEN 0 ELSE 1 END;
    DECLARE @hasIsActive bit = CASE WHEN COL_LENGTH(''dbo.UsageTypes'', ''IsActive'') IS NULL THEN 0 ELSE 1 END;
    DECLARE @hasIsDeleted bit = CASE WHEN COL_LENGTH(''dbo.UsageTypes'', ''IsDeleted'') IS NULL THEN 0 ELSE 1 END;
    DECLARE @hasTransferDeleted bit = CASE WHEN COL_LENGTH(''dbo.Transfers'', ''DeletedTime'') IS NULL THEN 0 ELSE 1 END;

    DECLARE @sql nvarchar(max) = N''SELECT
        UsageTypeId,
        UsageTypeCode,
        UsageTypeNameEn,
        '' + CASE WHEN @hasNameAr = 1 THEN N''UsageTypeNameAr'' ELSE N''CAST(NULL AS nvarchar(100)) AS UsageTypeNameAr'' END + N'',
        '' + CASE WHEN @hasIsActive = 1 THEN N''IsActive'' ELSE N''CAST(1 AS bit) AS IsActive'' END + N'',
        CAST(CASE WHEN EXISTS (
            SELECT 1 FROM dbo.Transfers t
            WHERE t.UsageTypeId = ut.UsageTypeId '' + CASE WHEN @hasTransferDeleted = 1 THEN N''AND t.DeletedTime IS NULL'' ELSE N'''' END + N''
        ) THEN 1 ELSE 0 END AS bit) AS HasMovements
    FROM dbo.UsageTypes ut
    WHERE 1=1 ''
    + CASE WHEN @hasIsDeleted = 1 THEN N'' AND IsDeleted = 0'' ELSE N'''' END
    + CASE WHEN @hasIsActive = 1 THEN N'' AND (@ActiveOnly = 0 OR IsActive = 1)'' ELSE N'''' END
    + N'' ORDER BY UsageTypeNameEn'';

    EXEC sp_executesql @sql, N''@ActiveOnly bit'', @ActiveOnly;
END;
');

IF OBJECT_ID('dbo.uspCreateUsageType', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.uspCreateUsageType AS BEGIN SET NOCOUNT ON; END');
EXEC(N'
ALTER PROCEDURE dbo.uspCreateUsageType
    @UsageTypeCode nvarchar(50),
    @UsageTypeNameEn nvarchar(100),
    @UsageTypeNameAr nvarchar(100) = NULL,
    @CreatedBy nvarchar(100) = NULL
AS
BEGIN
    DECLARE @hasNameAr bit = CASE WHEN COL_LENGTH(''dbo.UsageTypes'', ''UsageTypeNameAr'') IS NULL THEN 0 ELSE 1 END;
    DECLARE @hasCreatedBy bit = CASE WHEN COL_LENGTH(''dbo.UsageTypes'', ''CreatedBy'') IS NULL THEN 0 ELSE 1 END;

    DECLARE @cols nvarchar(max) = N''UsageTypeCode, UsageTypeNameEn'';
    DECLARE @vals nvarchar(max) = N''@UsageTypeCode, @UsageTypeNameEn'';
    IF @hasNameAr = 1 BEGIN SET @cols += N'', UsageTypeNameAr''; SET @vals += N'', @UsageTypeNameAr''; END;
    IF @hasCreatedBy = 1 BEGIN SET @cols += N'', CreatedBy''; SET @vals += N'', @CreatedBy''; END;

    DECLARE @sql nvarchar(max) = N''INSERT dbo.UsageTypes ('' + @cols + N'') OUTPUT inserted.UsageTypeId VALUES ('' + @vals + N'');'';
    EXEC sp_executesql @sql,
        N''@UsageTypeCode nvarchar(50), @UsageTypeNameEn nvarchar(100), @UsageTypeNameAr nvarchar(100), @CreatedBy nvarchar(100)'',
        @UsageTypeCode, @UsageTypeNameEn, @UsageTypeNameAr, @CreatedBy;
END;
');

IF OBJECT_ID('dbo.uspUpdateUsageType', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.uspUpdateUsageType AS BEGIN SET NOCOUNT ON; END');
EXEC(N'
ALTER PROCEDURE dbo.uspUpdateUsageType
    @UsageTypeId uniqueidentifier,
    @UsageTypeCode nvarchar(50),
    @UsageTypeNameEn nvarchar(100),
    @UsageTypeNameAr nvarchar(100) = NULL,
    @IsActive bit,
    @ModifiedBy nvarchar(100) = NULL
AS
BEGIN
    DECLARE @hasNameAr bit = CASE WHEN COL_LENGTH(''dbo.UsageTypes'', ''UsageTypeNameAr'') IS NULL THEN 0 ELSE 1 END;
    DECLARE @hasIsActive bit = CASE WHEN COL_LENGTH(''dbo.UsageTypes'', ''IsActive'') IS NULL THEN 0 ELSE 1 END;
    DECLARE @hasIsDeleted bit = CASE WHEN COL_LENGTH(''dbo.UsageTypes'', ''IsDeleted'') IS NULL THEN 0 ELSE 1 END;

    DECLARE @set nvarchar(max) = N''UsageTypeCode=@UsageTypeCode, UsageTypeNameEn=@UsageTypeNameEn'';
    IF @hasNameAr = 1 SET @set += N'', UsageTypeNameAr=@UsageTypeNameAr'';
    IF @hasIsActive = 1 SET @set += N'', IsActive=@IsActive'';

    DECLARE @sql nvarchar(max) = N''UPDATE dbo.UsageTypes SET '' + @set + N'' WHERE UsageTypeId=@UsageTypeId''
        + CASE WHEN @hasIsDeleted = 1 THEN N'' AND IsDeleted=0'' ELSE N'''' END;

    EXEC sp_executesql @sql,
        N''@UsageTypeId uniqueidentifier,@UsageTypeCode nvarchar(50),@UsageTypeNameEn nvarchar(100),@UsageTypeNameAr nvarchar(100),@IsActive bit'',
        @UsageTypeId,@UsageTypeCode,@UsageTypeNameEn,@UsageTypeNameAr,@IsActive;
END;
');

IF OBJECT_ID('dbo.uspDeleteUsageType', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.uspDeleteUsageType AS BEGIN SET NOCOUNT ON; END');
EXEC(N'
ALTER PROCEDURE dbo.uspDeleteUsageType
    @UsageTypeId uniqueidentifier,
    @DeletedBy nvarchar(100) = NULL
AS
BEGIN
    DECLARE @hasTransferDeleted bit = CASE WHEN COL_LENGTH(''dbo.Transfers'', ''DeletedTime'') IS NULL THEN 0 ELSE 1 END;
    DECLARE @hasIsDeleted bit = CASE WHEN COL_LENGTH(''dbo.UsageTypes'', ''IsDeleted'') IS NULL THEN 0 ELSE 1 END;
    DECLARE @hasIsActive bit = CASE WHEN COL_LENGTH(''dbo.UsageTypes'', ''IsActive'') IS NULL THEN 0 ELSE 1 END;

    DECLARE @checkSql nvarchar(max) = N''IF EXISTS (SELECT 1 FROM dbo.Transfers WHERE UsageTypeId=@UsageTypeId ''
        + CASE WHEN @hasTransferDeleted = 1 THEN N''AND DeletedTime IS NULL'' ELSE N'''' END + N'')
        THROW 51005, ''''Usage type has movements.'''', 1;'';
    EXEC sp_executesql @checkSql, N''@UsageTypeId uniqueidentifier'', @UsageTypeId;

    IF @hasIsDeleted = 1
    BEGIN
        DECLARE @set nvarchar(max) = N''IsDeleted=1'';
        IF @hasIsActive = 1 SET @set += N'', IsActive=0'';
        DECLARE @sql nvarchar(max) = N''UPDATE dbo.UsageTypes SET '' + @set + N'' WHERE UsageTypeId=@UsageTypeId'';
        EXEC sp_executesql @sql, N''@UsageTypeId uniqueidentifier'', @UsageTypeId;
    END
    ELSE
        DELETE FROM dbo.UsageTypes WHERE UsageTypeId=@UsageTypeId;
END;
');

/* =====================
   Reporting procedures
   ===================== */

IF OBJECT_ID('dbo.uspGetCreditMovements', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.uspGetCreditMovements AS BEGIN SET NOCOUNT ON; END');
EXEC(N'
ALTER PROCEDURE dbo.uspGetCreditMovements
    @StartDate date,
    @EndDate date,
    @SearchValue nvarchar(200) = NULL
AS
SELECT
    rt.ResourceTypeNameEn AS GroupName,
    SUM(r.Amount) AS TotalAmount
FROM dbo.Resources r
INNER JOIN dbo.ResourceTypes rt ON rt.ResourceTypeId = r.ResourceTypeId
WHERE r.DeletedTime IS NULL
  AND r.ResourceDate >= @StartDate
  AND r.ResourceDate < DATEADD(day, 1, @EndDate)
  AND (@SearchValue IS NULL OR rt.ResourceTypeNameEn LIKE ''%'' + @SearchValue + ''%'')
GROUP BY rt.ResourceTypeNameEn
ORDER BY rt.ResourceTypeNameEn;
');

IF OBJECT_ID('dbo.uspGetDebitMovements', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.uspGetDebitMovements AS BEGIN SET NOCOUNT ON; END');
EXEC(N'
ALTER PROCEDURE dbo.uspGetDebitMovements
    @StartDate date,
    @EndDate date,
    @SearchValue nvarchar(200) = NULL
AS
SELECT
    b.BeneficiaryNameEn AS GroupName,
    SUM(t.Amount) AS TotalAmount
FROM dbo.Transfers t
INNER JOIN dbo.Beneficiaries b ON b.BeneficiaryId = t.BeneficiaryId
WHERE t.DeletedTime IS NULL
  AND t.TransferStatus = ''Confirmed''
  AND t.TransferDate >= @StartDate
  AND t.TransferDate < DATEADD(day, 1, @EndDate)
  AND (@SearchValue IS NULL OR b.BeneficiaryNameEn LIKE ''%'' + @SearchValue + ''%'')
GROUP BY b.BeneficiaryNameEn
ORDER BY b.BeneficiaryNameEn;
');

IF OBJECT_ID('dbo.uspGetResourcesReport', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.uspGetResourcesReport AS BEGIN SET NOCOUNT ON; END');
EXEC(N'
ALTER PROCEDURE dbo.uspGetResourcesReport
    @StartDate date = NULL,
    @EndDate date = NULL
AS
SELECT
    rt.ResourceTypeNameEn AS ResourceTypeName,
    SUM(r.Amount) AS TotalAmount
FROM dbo.Resources r
INNER JOIN dbo.ResourceTypes rt ON rt.ResourceTypeId = r.ResourceTypeId
WHERE r.DeletedTime IS NULL
  AND (@StartDate IS NULL OR r.ResourceDate >= @StartDate)
  AND (@EndDate IS NULL OR r.ResourceDate < DATEADD(day, 1, @EndDate))
GROUP BY rt.ResourceTypeNameEn
ORDER BY rt.ResourceTypeNameEn;
');

IF OBJECT_ID('dbo.uspGetCorrespondentBalanceReport', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.uspGetCorrespondentBalanceReport AS BEGIN SET NOCOUNT ON; END');
EXEC(N'
ALTER PROCEDURE dbo.uspGetCorrespondentBalanceReport
    @SearchValue nvarchar(200) = NULL
AS
SELECT
    c.CorrespondentNameEn,
    cur.CurrencyCode,
    a.AccountNumber,
    a.CurrentBalance
FROM dbo.CorrespondentAccounts a
INNER JOIN dbo.Correspondents c ON c.CorrespondentId = a.CorrespondentId
INNER JOIN dbo.Currencies cur ON cur.CurrencyId = a.CurrencyId
WHERE a.IsDeleted = 0
  AND c.IsDeleted = 0
  AND (
        @SearchValue IS NULL
        OR c.CorrespondentNameEn LIKE ''%'' + @SearchValue + ''%''
        OR cur.CurrencyCode LIKE ''%'' + @SearchValue + ''%''
        OR a.AccountNumber LIKE ''%'' + @SearchValue + ''%''
      )
ORDER BY c.CorrespondentNameEn, cur.CurrencyCode, a.AccountNumber;
');
