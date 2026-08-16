using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using RevenuUsage.Application.Common.Interfaces;

namespace RevenuUsage.Infrastructure.Services;

/// <summary>
/// Reads current-user identity from CBOS OIDC JWT claims.
/// The active role is sent by the Angular client in X-Active-Role-Id.
/// </summary>
public sealed class CurrentUserService : ICurrentUserService
{
    private const string ActiveRoleHeader = "X-Active-Role-Id";
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? Principal => _httpContextAccessor.HttpContext?.User;

    private string? Claim(string claimType) =>
        Principal?.Claims.FirstOrDefault(c => c.Type == claimType)?.Value;

    public string? UserId =>
        Claim(ClaimTypes.NameIdentifier) ?? Claim("sub");

    public string? UserName =>
        Claim(ClaimTypes.Name) ?? Claim("name");

    public string? Email =>
        Claim(ClaimTypes.Email) ?? Claim("email");

    public string? FullName => Claim("preferred_username");
    public string? FullNameAr => Claim("full_name_ar");

    public string? OrganizationId =>
        FindClaimValue("org_id", "organization_id", "orgId", "organizationId");

    public string? OrganizationName => Claim("org_name");

    public List<string> Roles =>
        Principal?.Claims
            .Where(c => c.Type == ClaimTypes.Role || c.Type == "role")
            .Select(c => c.Value)
            .ToList()
        ?? [];

    public bool IsAuthenticated =>
        Principal?.Identity?.IsAuthenticated ?? false;

    public string? ActiveRoleId =>
        _httpContextAccessor.HttpContext?.Request.Headers[ActiveRoleHeader].FirstOrDefault();

    public bool IsInRole(string role) =>
        Principal?.Claims.Any(c =>
            (c.Type == ClaimTypes.Role || c.Type == "role") && c.Value == role) ?? false;

    private string? FindClaimValue(params string[] claimTypes)
    {
        if (Principal is null) return null;

        foreach (var type in claimTypes)
        {
            var value = Principal.Claims.FirstOrDefault(c => c.Type == type)?.Value;
            if (!string.IsNullOrWhiteSpace(value)) return value;
        }

        var typeSet = new HashSet<string>(claimTypes, StringComparer.OrdinalIgnoreCase);
        return Principal.Claims
            .FirstOrDefault(c => typeSet.Contains(c.Type) && !string.IsNullOrWhiteSpace(c.Value))
            ?.Value;
    }
}
