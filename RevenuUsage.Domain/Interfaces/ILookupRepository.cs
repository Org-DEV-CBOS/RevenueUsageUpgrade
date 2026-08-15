using RevenuUsage.Domain.Entities;

namespace RevenuUsage.Domain.Interfaces;

public interface ILookupRepository
{
    // Banks
    Task<IEnumerable<Bank>> GetAllBanksAsync(CancellationToken cancellationToken = default);
    Task<Bank?> GetBankByIdAsync(Guid bankId, CancellationToken cancellationToken = default);
    Task<Guid> CreateBankAsync(Bank bank, CancellationToken cancellationToken = default);
    Task UpdateBankAsync(Bank bank, CancellationToken cancellationToken = default);
    Task DeleteBankAsync(Guid bankId, string deletedBy, CancellationToken cancellationToken = default);

    // Companies
    Task<IEnumerable<Company>> GetAllCompaniesAsync(CancellationToken cancellationToken = default);
    Task<Company?> GetCompanyByIdAsync(Guid companyId, CancellationToken cancellationToken = default);
    Task<Guid> CreateCompanyAsync(Company company, CancellationToken cancellationToken = default);
    Task UpdateCompanyAsync(Company company, CancellationToken cancellationToken = default);
    Task DeleteCompanyAsync(Guid companyId, string deletedBy, CancellationToken cancellationToken = default);

    // Countries
    Task<IEnumerable<Country>> GetAllCountriesAsync(CancellationToken cancellationToken = default);
    Task<Country?> GetCountryByIdAsync(Guid countryId, CancellationToken cancellationToken = default);
    Task<Guid> CreateCountryAsync(Country country, CancellationToken cancellationToken = default);
    Task UpdateCountryAsync(Country country, CancellationToken cancellationToken = default);
    Task DeleteCountryAsync(Guid countryId, string deletedBy, CancellationToken cancellationToken = default);
}
