using Microsoft.AspNetCore.Mvc;
using RevenuUsage.API.Controllers;
namespace RevenuUsage.Tests;
public sealed class ApiRouteContractTests
{
    [Theory]
    [InlineData(typeof(CoveragesController), "api/[controller]")]
    [InlineData(typeof(DealsController), "api/[controller]")]
    [InlineData(typeof(ReservesController), "api/[controller]")]
    [InlineData(typeof(ReportsController), "api/[controller]")]
    public void Workflow_controllers_expose_expected_route(Type controller,string template) => Assert.Equal(template, controller.GetCustomAttributes(typeof(RouteAttribute),true).Cast<RouteAttribute>().Single().Template);

    [Fact]
    public void Reports_exposes_all_reconciled_report_routes()
    {
        var routes=typeof(ReportsController).GetMethods().SelectMany(m=>m.GetCustomAttributes(typeof(HttpGetAttribute),true).Cast<HttpGetAttribute>()).Select(x=>x.Template).ToArray();
        Assert.Contains("dashboard",routes);Assert.Contains("foreign-reserve",routes);Assert.Contains("obligations",routes);
    }
}
