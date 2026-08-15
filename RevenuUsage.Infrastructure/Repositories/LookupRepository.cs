using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using RevenuUsage.Domain.Entities;
using RevenuUsage.Domain.Interfaces;
using System.Data;

namespace RevenuUsage.Infrastructure.Repositories;

public class LookupRepository : ILookupRepository
{
    private readonly IDbConnection _connection;

    public LookupRepository(IConfiguration configuration)
    {
        _connection = new SqlConnection(configuration.GetConnectionString("DB_Connection"));
    }

    #region Banks

    public async Task<IEnumerable<Bank>> GetAllBanksAsync(CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        var sql = @"SELECT bankId, bankCode, bankNameEn, bankNameAr, shortName, isActive, isDeleted, 
                           createdTime, createdBy, modifiedTime, modifiedBy, deletedTime, deletedBy
                    FROM dbo.banks
                    WHERE isDeleted = 0
                    ORDER BY bankNameAr";

        var result = await _connection.QueryAsync<Bank>(sql);
        return result;
    }

    public async Task<Bank?> GetBankByIdAsync(Guid bankId, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        var sql = @"SELECT bankId, bankCode, bankNameEn, bankNameAr, shortName, isActive, isDeleted, 
                           createdTime, createdBy, modifiedTime, modifiedBy, deletedTime, deletedBy
                    FROM dbo.banks
                    WHERE bankId = @BankId AND isDeleted = 0";

        var result = await _connection.QueryFirstOrDefaultAsync<Bank>(sql, new { BankId = bankId });
        return result;
    }

    public async Task<Guid> CreateBankAsync(Bank bank, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        using var transaction = _connection.BeginTransaction();

        try
        {
            var sql = @"INSERT INTO dbo.banks (bankCode, bankNameEn, bankNameAr, shortName, createdBy)
                        OUTPUT INSERTED.bankId
                        VALUES (@BankCode, @BankNameEn, @BankNameAr, @ShortName, @CreatedBy)";

            var bankId = await _connection.ExecuteScalarAsync<Guid>(sql, bank, transaction);

            transaction.Commit();
            return bankId;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task UpdateBankAsync(Bank bank, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        using var transaction = _connection.BeginTransaction();

        try
        {
            var sql = @"UPDATE dbo.banks
                        SET bankCode = @BankCode,
                            bankNameEn = @BankNameEn,
                            bankNameAr = @BankNameAr,
                            shortName = @ShortName,
                            isActive = @IsActive,
                            modifiedTime = SYSUTCDATETIME(),
                            modifiedBy = @ModifiedBy
                        WHERE bankId = @BankId AND isDeleted = 0";

            await _connection.ExecuteAsync(sql, bank, transaction);

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task DeleteBankAsync(Guid bankId, string deletedBy, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        using var transaction = _connection.BeginTransaction();

        try
        {
            var sql = @"UPDATE dbo.banks
                        SET isDeleted = 1,
                            deletedTime = SYSUTCDATETIME(),
                            deletedBy = @DeletedBy
                        WHERE bankId = @BankId";

            await _connection.ExecuteAsync(sql, new { BankId = bankId, DeletedBy = deletedBy }, transaction);

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    #endregion

    #region Companies

    public async Task<IEnumerable<Company>> GetAllCompaniesAsync(CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        var sql = @"SELECT companyId, companyCode, companyNameEn, companyNameAr, shortName, notes, isActive, isDeleted, 
                           createdTime, createdBy, modifiedTime, modifiedBy, deletedTime, deletedBy
                    FROM dbo.companies
                    WHERE isDeleted = 0
                    ORDER BY companyNameAr";

        var result = await _connection.QueryAsync<Company>(sql);
        return result;
    }

    public async Task<Company?> GetCompanyByIdAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        var sql = @"SELECT companyId, companyCode, companyNameEn, companyNameAr, shortName, notes, isActive, isDeleted, 
                           createdTime, createdBy, modifiedTime, modifiedBy, deletedTime, deletedBy
                    FROM dbo.companies
                    WHERE companyId = @CompanyId AND isDeleted = 0";

        var result = await _connection.QueryFirstOrDefaultAsync<Company>(sql, new { CompanyId = companyId });
        return result;
    }

    public async Task<Guid> CreateCompanyAsync(Company company, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        using var transaction = _connection.BeginTransaction();

        try
        {
            var sql = @"INSERT INTO dbo.companies (companyCode, companyNameEn, companyNameAr, shortName, notes, createdBy)
                        OUTPUT INSERTED.companyId
                        VALUES (@CompanyCode, @CompanyNameEn, @CompanyNameAr, @ShortName, @Notes, @CreatedBy)";

            var companyId = await _connection.ExecuteScalarAsync<Guid>(sql, company, transaction);

            transaction.Commit();
            return companyId;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task UpdateCompanyAsync(Company company, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        using var transaction = _connection.BeginTransaction();

        try
        {
            var sql = @"UPDATE dbo.companies
                        SET companyCode = @CompanyCode,
                            companyNameEn = @CompanyNameEn,
                            companyNameAr = @CompanyNameAr,
                            shortName = @ShortName,
                            notes = @Notes,
                            isActive = @IsActive,
                            modifiedTime = SYSUTCDATETIME(),
                            modifiedBy = @ModifiedBy
                        WHERE companyId = @CompanyId AND isDeleted = 0";

            await _connection.ExecuteAsync(sql, company, transaction);

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task DeleteCompanyAsync(Guid companyId, string deletedBy, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        using var transaction = _connection.BeginTransaction();

        try
        {
            var sql = @"UPDATE dbo.companies
                        SET isDeleted = 1,
                            deletedTime = SYSUTCDATETIME(),
                            deletedBy = @DeletedBy
                        WHERE companyId = @CompanyId";

            await _connection.ExecuteAsync(sql, new { CompanyId = companyId, DeletedBy = deletedBy }, transaction);

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    #endregion

    #region Countries

    public async Task<IEnumerable<Country>> GetAllCountriesAsync(CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        var sql = @"SELECT countryId, countryCode, countryNameEn, countryNameAr, isoCode, isActive, isDeleted, 
                           createdTime, createdBy, modifiedTime, modifiedBy, deletedTime, deletedBy
                    FROM dbo.countries
                    WHERE isDeleted = 0
                    ORDER BY countryNameAr";

        var result = await _connection.QueryAsync<Country>(sql);
        return result;
    }

    public async Task<Country?> GetCountryByIdAsync(Guid countryId, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        var sql = @"SELECT countryId, countryCode, countryNameEn, countryNameAr, isoCode, isActive, isDeleted, 
                           createdTime, createdBy, modifiedTime, modifiedBy, deletedTime, deletedBy
                    FROM dbo.countries
                    WHERE countryId = @CountryId AND isDeleted = 0";

        var result = await _connection.QueryFirstOrDefaultAsync<Country>(sql, new { CountryId = countryId });
        return result;
    }

    public async Task<Guid> CreateCountryAsync(Country country, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        using var transaction = _connection.BeginTransaction();

        try
        {
            var sql = @"INSERT INTO dbo.countries (countryCode, countryNameEn, countryNameAr, isoCode, createdBy)
                        OUTPUT INSERTED.countryId
                        VALUES (@CountryCode, @CountryNameEn, @CountryNameAr, @IsoCode, @CreatedBy)";

            var countryId = await _connection.ExecuteScalarAsync<Guid>(sql, country, transaction);

            transaction.Commit();
            return countryId;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task UpdateCountryAsync(Country country, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        using var transaction = _connection.BeginTransaction();

        try
        {
            var sql = @"UPDATE dbo.countries
                        SET countryCode = @CountryCode,
                            countryNameEn = @CountryNameEn,
                            countryNameAr = @CountryNameAr,
                            isoCode = @IsoCode,
                            isActive = @IsActive,
                            modifiedTime = SYSUTCDATETIME(),
                            modifiedBy = @ModifiedBy
                        WHERE countryId = @CountryId AND isDeleted = 0";

            await _connection.ExecuteAsync(sql, country, transaction);

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task DeleteCountryAsync(Guid countryId, string deletedBy, CancellationToken cancellationToken = default)
    {
        if (_connection.State != ConnectionState.Open)
            _connection.Open();

        using var transaction = _connection.BeginTransaction();

        try
        {
            var sql = @"UPDATE dbo.countries
                        SET isDeleted = 1,
                            deletedTime = SYSUTCDATETIME(),
                            deletedBy = @DeletedBy
                        WHERE countryId = @CountryId";

            await _connection.ExecuteAsync(sql, new { CountryId = countryId, DeletedBy = deletedBy }, transaction);

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    #endregion
}
