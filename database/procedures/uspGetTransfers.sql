CREATE OR ALTER PROCEDURE dbo.uspGetTransfers
    @CorrespondentAccountId uniqueidentifier = NULL,
    @BeneficiaryId uniqueidentifier = NULL,
    @CurrencyId uniqueidentifier = NULL,
    @Status nvarchar(20) = NULL,
    @StartDate datetime2 = NULL,
    @EndDate datetime2 = NULL,
    @PageNumber int = 1,
    @PageSize int = 25
AS
BEGIN
    SET NOCOUNT ON;

    IF @PageNumber < 1 OR @PageSize < 1 OR @PageSize > 200
        THROW 50001, 'Invalid paging parameters.', 1;

    ;WITH FilteredTransfers AS
    (
        SELECT
            t.TransferId,
            t.TransferDate,
            t.CorrespondentAccountId,
            ca.AccountNumber,
            c.CorrespondentNameEn AS AccountName,
            t.BeneficiaryId,
            b.BeneficiaryNameEn AS BeneficiaryName,
            ca.CurrencyId,
            currency.CurrencyCode,
            t.Amount,
            t.Purpose,
            t.ReferenceNo,
            t.TransferStatus,
            t.ConfirmedTime,
            t.RejectedTime,
            t.RejectReason
        FROM dbo.Transfers AS t
        INNER JOIN dbo.CorrespondentAccounts AS ca
            ON ca.CorrespondentAccountId = t.CorrespondentAccountId
        INNER JOIN dbo.Correspondents AS c
            ON c.CorrespondentId = ca.CorrespondentId
        INNER JOIN dbo.Beneficiaries AS b
            ON b.BeneficiaryId = t.BeneficiaryId
        INNER JOIN dbo.Currencies AS currency
            ON currency.CurrencyId = ca.CurrencyId
        WHERE t.DeletedTime IS NULL
          AND (@CorrespondentAccountId IS NULL OR t.CorrespondentAccountId = @CorrespondentAccountId)
          AND (@BeneficiaryId IS NULL OR t.BeneficiaryId = @BeneficiaryId)
          AND (@CurrencyId IS NULL OR ca.CurrencyId = @CurrencyId)
          AND (@Status IS NULL OR t.TransferStatus = @Status)
          AND (@StartDate IS NULL OR t.TransferDate >= @StartDate)
          AND (@EndDate IS NULL OR t.TransferDate < DATEADD(day, 1, CONVERT(date, @EndDate)))
    )
    SELECT
        TransferId,
        TransferDate,
        CorrespondentAccountId,
        AccountNumber,
        AccountName,
        BeneficiaryId,
        BeneficiaryName,
        CurrencyId,
        CurrencyCode,
        Amount,
        Purpose,
        ReferenceNo,
        TransferStatus,
        ConfirmedTime,
        RejectedTime,
        RejectReason
    FROM FilteredTransfers
    ORDER BY TransferDate DESC, TransferId DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT(1)
    FROM dbo.Transfers AS t
    INNER JOIN dbo.CorrespondentAccounts AS ca
        ON ca.CorrespondentAccountId = t.CorrespondentAccountId
    WHERE t.DeletedTime IS NULL
      AND (@CorrespondentAccountId IS NULL OR t.CorrespondentAccountId = @CorrespondentAccountId)
      AND (@BeneficiaryId IS NULL OR t.BeneficiaryId = @BeneficiaryId)
      AND (@CurrencyId IS NULL OR ca.CurrencyId = @CurrencyId)
      AND (@Status IS NULL OR t.TransferStatus = @Status)
      AND (@StartDate IS NULL OR t.TransferDate >= @StartDate)
      AND (@EndDate IS NULL OR t.TransferDate < DATEADD(day, 1, CONVERT(date, @EndDate)));
END;
