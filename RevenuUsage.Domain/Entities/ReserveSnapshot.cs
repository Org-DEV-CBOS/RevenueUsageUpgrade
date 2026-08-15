namespace RevenuUsage.Domain.Entities;
public sealed class ReserveSnapshot { public Guid ReserveSnapshotId{get;set;} public DateTime ReserveDate{get;set;} public decimal GoldValue{get;set;} public decimal CashInHand{get;set;} public decimal Deposits{get;set;} public decimal TotalValue=>GoldValue+CashInHand+Deposits; public string? Notes{get;set;} }
