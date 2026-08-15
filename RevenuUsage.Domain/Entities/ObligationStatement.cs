namespace RevenuUsage.Domain.Entities;

public class ObligationStatement
{
    public Obligation Obligation { get; set; } = new();
    public List<ObligationPayment> Payments { get; set; } = [];
}
