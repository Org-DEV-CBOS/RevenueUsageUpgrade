SET NOCOUNT ON;
DECLARE @Required TABLE(Name sysname);INSERT @Required VALUES
('uspGetTransfers'),('uspCreateTransfer'),('uspConfirmTransfer'),('uspRejectTransfer'),('uspDeleteTransfer'),('uspGetCorrespondentAccountStatement'),('uspGetFinalBankPosition'),('uspGetCurrencyStatement'),
('uspGetBeneficiaries'),('uspGetBeneficiaryById'),('uspCreateBeneficiary'),('uspUpdateBeneficiary'),('uspDeleteBeneficiary'),('uspGetBeneficiaryStatement'),
('uspGetCurrencies'),('uspGetCurrencyById'),('uspCreateCurrency'),('uspUpdateCurrency'),('uspDeleteCurrency'),('uspGetCurrencyBalances'),('uspGetDailyValuation'),('uspGetExchangeRate'),('uspAddExchangeRate'),('uspDeleteExchangeRate'),('uspGetCorrespondentBalancesByCurrency'),
('uspGetResourceTypes'),('uspGetResourceTypeById'),('uspCreateResourceType'),('uspUpdateResourceType'),('uspDeleteResourceType'),('uspAddResourceToCorrespondentAccount'),('uspDeleteResource'),('uspGetResourceStatement'),
('uspGetCorrespondents'),('uspGetCorrespondentById'),('uspCreateCorrespondent'),('uspUpdateCorrespondent'),('uspDeleteCorrespondent'),('uspGetCorrespondentAccounts'),('uspGetCorrespondentAccountById'),('uspCreateCorrespondentAccount'),('uspUpdateCorrespondentAccount'),('uspDeleteCorrespondentAccount'),
('uspGetCoverages'),('uspCreateCoverage'),('uspDeleteCoverage'),('uspGetDeals'),('uspCreateDeal'),('uspDeleteDeal'),('uspGetReserveSnapshots'),('uspCreateReserveSnapshot'),('uspDeleteReserveSnapshot'),
('uspGetObligations'),('uspCreateObligation'),('uspDeleteObligation'),('uspAddObligationPayment'),('uspDeleteObligationPayment'),('uspGetObligationStatement'),('uspGetDashboardSummary'),('uspGetForeignReserveReport'),('uspGetObligationReport');
DECLARE @missing nvarchar(max)='';SELECT @missing=@missing+CASE WHEN @missing='' THEN '' ELSE ', ' END+Name FROM @Required r WHERE OBJECT_ID('dbo.'+r.Name,'P')IS NULL;IF @missing<>'' THROW 54001,@missing,1;
IF NOT EXISTS(SELECT 1 FROM dbo.OperationTypes WHERE OperationTypeCode='TRANSFER')THROW 54002,'TRANSFER operation type is missing.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.UsageTypes WHERE UsageTypeCode='BENEFICIARY')THROW 54003,'BENEFICIARY usage type is missing.',1;
SELECT 'Database deployment verified' Result,(SELECT COUNT(*)FROM @Required)ProcedureCount;
