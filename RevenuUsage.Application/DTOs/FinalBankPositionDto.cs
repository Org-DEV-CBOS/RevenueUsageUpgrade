namespace RevenuUsage.Application.DTOs
{
    public sealed record FinalBankPositionDto(
    DateTime PositionDate,
    decimal CashInHandUsd,
    decimal GoldValueUsd,
    decimal TotalCorrespondentBalancesUsd,
    decimal BankNetPositionUsd
);

}
