/*
Target DB: RUTS_NEW
Makes a transfer's paperwork optional while it is Pending.

Table changes (dbo.Transfers):
    StatementDate date NULL          -- added here if it is not already present
    Purpose       nvarchar(500) NULL -- was NOT NULL
    ReferenceNo   nvarchar(100) NULL -- was NOT NULL

A reference number and statement date are still required to confirm a transfer;
dbo.uspConfirmTransfer enforces that and throws 52015 / 52016 when either is missing.

Modified stored procedures (deploy from SQL_OBJECTS):
    dbo.uspCreateTransfer   (@Purpose / @ReferenceNo optional, + @StatementDate)
    dbo.uspConfirmTransfer  (+ @ReferenceNo, @StatementDate; requires both)
    dbo.uspGetTransfers     (returns StatementDate)

Compatibility: no GO, safe to re-run.
*/

SET NOCOUNT ON;

IF COL_LENGTH('dbo.Transfers', 'StatementDate') IS NULL
    EXEC('ALTER TABLE dbo.Transfers ADD StatementDate date NULL;');

IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Transfers')
      AND name = 'Purpose'
      AND is_nullable = 0
)
    EXEC('ALTER TABLE dbo.Transfers ALTER COLUMN Purpose nvarchar(500) NULL;');

IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Transfers')
      AND name = 'ReferenceNo'
      AND is_nullable = 0
)
    EXEC('ALTER TABLE dbo.Transfers ALTER COLUMN ReferenceNo nvarchar(100) NULL;');

-- Rows created before this change may carry '' where the intent was "not supplied";
-- the confirm check tests for NULL, so normalise them.
UPDATE dbo.Transfers
SET Purpose = NULL
WHERE Purpose IS NOT NULL AND LTRIM(RTRIM(Purpose)) = N'';

UPDATE dbo.Transfers
SET ReferenceNo = NULL
WHERE ReferenceNo IS NOT NULL AND LTRIM(RTRIM(ReferenceNo)) = N'';
