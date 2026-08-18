using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Features.Correspondents;

namespace RevenuUsage.Tests;

public sealed class CorrespondentRequestValidatorTests
{
    [Fact]
    public async Task Correspondent_requires_code_english_name_and_country()
    {
        var command = new CreateCorrespondentCommand(new CreateCorrespondentDto("", "", null, null, null));

        var result = await new CreateCorrespondentCommandValidator().ValidateAsync(command);

        Assert.Contains(result.Errors, error => error.PropertyName.EndsWith("CorrespondentCode"));
        Assert.Contains(result.Errors, error => error.PropertyName.EndsWith("CorrespondentNameEn"));
        Assert.Contains(result.Errors, error => error.PropertyName.EndsWith("CountryId"));
    }

    [Fact]
    public async Task Account_requires_parent_currency_and_number()
    {
        var command = new CreateCorrespondentAccountCommand(
            new CreateCorrespondentAccountDto(Guid.Empty, Guid.Empty, "", 0, null));

        var result = await new CreateCorrespondentAccountCommandValidator().ValidateAsync(command);

        Assert.Equal(3, result.Errors.Count);
    }

    [Fact]
    public async Task Account_rejects_negative_opening_balance()
    {
        var command = new CreateCorrespondentAccountCommand(
            new CreateCorrespondentAccountDto(Guid.NewGuid(), Guid.NewGuid(), "ACC-1", -1, null));

        var result = await new CreateCorrespondentAccountCommandValidator().ValidateAsync(command);

        Assert.Contains(result.Errors, error => error.PropertyName.EndsWith("OpeningBalance"));
    }
}
