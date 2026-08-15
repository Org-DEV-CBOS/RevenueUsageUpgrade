namespace RevenuUsage.Domain.Entities
{
    public sealed record FinalBankPosition(
    DateTime PositionDate,
    decimal CashInHandUsd,
    decimal GoldValueUsd,
    decimal TotalCorrespondentBalancesUsd,
    decimal BankNetPositionUsd
);

}
