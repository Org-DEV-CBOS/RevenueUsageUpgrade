using MediatR;

namespace RevenuUsage.Application.Common.Interfaces;

public interface IQuery<out TResponse> : IRequest<TResponse>
{
}
