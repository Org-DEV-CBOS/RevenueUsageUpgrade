using RevenuUsage.Application.Features.ReservesAndObligations;

namespace RevenuUsage.Tests;

public sealed class ReserveObligationValidatorTests
{
    [Fact]
    public async Task Empty_reserve_is_rejected()
    {
        var r = await new CreateReserveValidator().ValidateAsync(new CreateReserveCommand(DateTime.Today, 0, 0, 0, null, "user"));
        Assert.False(r.IsValid);
    }

    [Fact]
    public async Task Obligation_requires_currency_client_type_and_positive_amount()
    {
        var r = await Validate(Command(bankId: Guid.NewGuid(), companyId: null, clientTypeId: Guid.Empty, currencyId: Guid.Empty, totalAmount: 0));
        Assert.True(r.Errors.Count >= 3);
    }

    [Fact]
    public async Task Due_date_cannot_precede_obligation_date()
    {
        var r = await Validate(Command(bankId: Guid.NewGuid(), companyId: null, dueDate: DateTime.Today.AddDays(-1)));
        Assert.Contains(r.Errors, x => x.PropertyName == "DueDate");
    }

    [Fact]
    public async Task Obligation_takes_a_bank_or_a_company_but_not_both()
    {
        var r = await Validate(Command(bankId: Guid.NewGuid(), companyId: Guid.NewGuid(), obligationTypeId: Guid.NewGuid()));
        Assert.False(r.IsValid);
    }

    [Fact]
    public async Task Obligation_needs_one_of_them()
    {
        var r = await Validate(Command(bankId: null, companyId: null));
        Assert.False(r.IsValid);
    }

    [Fact]
    public async Task Bank_client_carries_no_obligation_type()
    {
        var r = await Validate(Command(bankId: Guid.NewGuid(), companyId: null, obligationTypeId: Guid.NewGuid()));
        Assert.Contains(r.Errors, x => x.PropertyName == "ObligationTypeId");
    }

    [Fact]
    public async Task Company_client_needs_an_obligation_type()
    {
        var r = await Validate(Command(bankId: null, companyId: Guid.NewGuid()));
        Assert.Contains(r.Errors, x => x.PropertyName == "ObligationTypeId");
    }

    [Fact]
    public async Task Bank_client_is_accepted()
    {
        var r = await Validate(Command(bankId: Guid.NewGuid(), companyId: null));
        Assert.True(r.IsValid);
    }

    [Fact]
    public async Task Company_client_with_an_obligation_type_is_accepted()
    {
        var r = await Validate(Command(bankId: null, companyId: Guid.NewGuid(), obligationTypeId: Guid.NewGuid()));
        Assert.True(r.IsValid);
    }

    private static Task<FluentValidation.Results.ValidationResult> Validate(CreateObligationCommand command) =>
        new CreateObligationValidator().ValidateAsync(command);

    /* Everything a valid obligation needs apart from the client, so each test varies only its own subject. */
    private static CreateObligationCommand Command(
        Guid? bankId,
        Guid? companyId,
        Guid? obligationTypeId = null,
        Guid? clientTypeId = null,
        Guid? currencyId = null,
        decimal totalAmount = 10,
        DateTime? dueDate = null) =>
        new(
            DateTime.Today,
            clientTypeId ?? Guid.NewGuid(),
            currencyId ?? Guid.NewGuid(),
            totalAmount,
            dueDate,
            null,
            null,
            "user",
            obligationTypeId,
            bankId,
            companyId);
}
