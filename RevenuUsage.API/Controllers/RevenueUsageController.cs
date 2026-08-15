using Microsoft.AspNetCore.Mvc;

namespace RevenuUsage.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RevenueUsageController : ControllerBase
{

    public RevenueUsageController()
    {
    }

    [HttpGet("/HealthCheck")]
    public async Task<ActionResult> HealthCheck()
    {
        return Ok(new { status = "OK" });
    }

}
