using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RevenuUsage.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RevenueUsageController : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("/HealthCheck")]
    public ActionResult HealthCheck()
    {
        return Ok(new { status = "OK" });
    }
}
