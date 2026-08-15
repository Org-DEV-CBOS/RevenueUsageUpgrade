namespace RevenuUsage.Application.DTOs
{
    public sealed record AccountStatementDto(
    DateTime EventDate,
    string EventType,
    decimal AmountIn,
    decimal AmountOut,
    decimal RunningBalance,
    string? Notes
);

}
