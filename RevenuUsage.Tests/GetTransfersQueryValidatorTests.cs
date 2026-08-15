using RevenuUsage.Application.Features.Transfers.Queries.GetTransfers;

namespace RevenuUsage.Tests;

public sealed class GetTransfersQueryValidatorTests
{
    private readonly GetTransfersQueryValidator _validator = new();

    [Fact]
    public async Task Valid_query_passes_validation()
    {
        var query = new GetTransfersQuery(
            null, null, null, "Pending",
            new DateTime(2026, 1, 1), new DateTime(2026, 1, 31),
            1, 50);

        var result = await _validator.ValidateAsync(query);

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData(0, 25)]
    [InlineData(1, 0)]
    [InlineData(1, 201)]
    public async Task Invalid_paging_fails_validation(int page, int pageSize)
    {
        var query = new GetTransfersQuery(null, null, null, null, null, null, page, pageSize);

        var result = await _validator.ValidateAsync(query);

        Assert.False(result.IsValid);
    }

    [Fact]
    public async Task End_date_before_start_date_fails_validation()
    {
        var query = new GetTransfersQuery(
            null, null, null, null,
            new DateTime(2026, 2, 1), new DateTime(2026, 1, 31));

        var result = await _validator.ValidateAsync(query);

        Assert.False(result.IsValid);
    }

    [Fact]
    public async Task Unknown_status_fails_validation()
    {
        var query = new GetTransfersQuery(null, null, null, "Deleted", null, null);

        var result = await _validator.ValidateAsync(query);

        Assert.False(result.IsValid);
    }
}
