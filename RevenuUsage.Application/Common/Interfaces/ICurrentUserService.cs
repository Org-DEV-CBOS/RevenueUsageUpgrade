namespace RevenuUsage.Application.Common.Interfaces;

/// <summary>
/// Current user identity from CBOS OIDC JWT claims.
/// Active role is read from the X-Active-Role-Id header, not from JWT.
/// </summary>
public interface ICurrentUserService
{
    string? UserId { get; }
    string? UserName { get; }
    string? Email { get; }
    string? FullName { get; }
    string? FullNameAr { get; }
    string? OrganizationId { get; }
    string? OrganizationName { get; }
    List<string> Roles { get; }
    bool IsAuthenticated { get; }
    string? ActiveRoleId { get; }
    bool IsInRole(string role);
}
