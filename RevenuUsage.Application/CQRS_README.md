# CQRS Implementation Guide

This solution has been configured to use the **CQRS (Command Query Responsibility Segregation)** pattern with **MediatR**.

## Package Dependencies

### Application Layer
- **MediatR** (v12.4.1) - CQRS mediator pattern implementation
- **FluentValidation** (v11.10.0) - Command/Query validation
- **FluentValidation.DependencyInjectionExtensions** (v11.10.0) - DI for validators

### API Layer
- **MediatR** (v12.4.1) - For injecting IMediator into controllers

## Project Structure

```
RevenuUsage.Application/
??? Common/
?   ??? Behaviors/
?   ?   ??? ValidationBehavior.cs          # Automatic validation pipeline
?   ??? Interfaces/
?       ??? ICommand.cs                     # Command marker interface
?       ??? ICommandHandler.cs              # Command handler interface
?       ??? IQuery.cs                       # Query marker interface
?       ??? IQueryHandler.cs                # Query handler interface
??? Features/
?   ??? RevenueUsages/
?   ?   ??? Commands/
?   ?   ?   ??? RecordRevenueUsage/
?   ?   ?       ??? RecordRevenueUsageCommand.cs
?   ?   ?       ??? RecordRevenueUsageCommandHandler.cs
?   ?   ?       ??? RecordRevenueUsageCommandValidator.cs
?   ?   ??? Queries/
?   ?       ??? GetRevenueUsageById/
?   ?           ??? GetRevenueUsageByIdQuery.cs
?   ?           ??? GetRevenueUsageByIdQueryHandler.cs
?   ?           ??? GetRevenueUsageByIdQueryValidator.cs
?   ??? Transfers/
?       ??? Commands/
?           ??? CreateTransfer/
?               ??? CreateTransferCommand.cs
?               ??? CreateTransferCommandHandler.cs
?               ??? CreateTransferCommandValidator.cs
??? DependencyInjection.cs                  # MediatR & validation registration
```

## How to Use

### 1. Creating a Command

Commands are operations that **change state** (Create, Update, Delete).

```csharp
// Define the command
public sealed record CreateSomethingCommand(
    string Name,
    decimal Amount) : ICommand<SomethingDto>;

// Create the handler
public sealed class CreateSomethingCommandHandler 
    : ICommandHandler<CreateSomethingCommand, SomethingDto>
{
    private readonly ISomethingService _service;

    public CreateSomethingCommandHandler(ISomethingService service)
    {
        _service = service;
    }

    public async Task<SomethingDto> Handle(
        CreateSomethingCommand request, 
        CancellationToken cancellationToken)
    {
        // Your business logic here
        return await _service.CreateAsync(request, cancellationToken);
    }
}

// Add validation (optional but recommended)
public sealed class CreateSomethingCommandValidator 
    : AbstractValidator<CreateSomethingCommand>
{
    public CreateSomethingCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
    }
}
```

### 2. Creating a Query

Queries are operations that **retrieve data** (Read operations).

```csharp
// Define the query
public sealed record GetSomethingByIdQuery(Guid Id) : IQuery<SomethingDto?>;

// Create the handler
public sealed class GetSomethingByIdQueryHandler 
    : IQueryHandler<GetSomethingByIdQuery, SomethingDto?>
{
    private readonly ISomethingRepository _repository;

    public GetSomethingByIdQueryHandler(ISomethingRepository repository)
    {
        _repository = repository;
    }

    public async Task<SomethingDto?> Handle(
        GetSomethingByIdQuery request, 
        CancellationToken cancellationToken)
    {
        return await _repository.GetByIdAsync(request.Id, cancellationToken);
    }
}

// Add validation
public sealed class GetSomethingByIdQueryValidator 
    : AbstractValidator<GetSomethingByIdQuery>
{
    public GetSomethingByIdQueryValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
```

### 3. Using in Controllers

Inject `IMediator` and send commands/queries:

```csharp
[ApiController]
[Route("api/[controller]")]
public class SomethingController : ControllerBase
{
    private readonly IMediator _mediator;

    public SomethingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<SomethingDto>> Create(
        [FromBody] CreateSomethingRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateSomethingCommand(request.Name, request.Amount);
        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SomethingDto>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetSomethingByIdQuery(id);
        var result = await _mediator.Send(query, cancellationToken);
        
        if (result is null)
            return NotFound();
            
        return Ok(result);
    }
}
```

## Features

### ? Automatic Validation
- All commands and queries are automatically validated before execution
- Validation failures throw `ValidationException` with detailed error messages
- Define validators using FluentValidation syntax

### ? Separation of Concerns
- **Commands**: Modify state, have side effects
- **Queries**: Read-only, no side effects
- Clear separation makes testing and maintenance easier

### ? Pipeline Behaviors
- `ValidationBehavior` automatically validates all requests
- Easy to add additional behaviors (Logging, Caching, etc.)

### ? Organized by Feature
- Each feature has its own folder with Commands and Queries
- All related code is grouped together (Command, Handler, Validator)

## Benefits

1. **Testability**: Each handler can be tested in isolation
2. **Maintainability**: Clear structure, easy to locate and modify features
3. **Scalability**: Easy to add new features without impacting existing code
4. **Validation**: Automatic request validation before handler execution
5. **Single Responsibility**: Each handler does one thing

## Next Steps

1. **Migrate existing UseCases** to Commands/Queries
2. **Add more Queries** for read operations
3. **Implement repository patterns** for query optimization
4. **Add logging behavior** for audit trails
5. **Consider read models** for complex queries (true CQRS with separate read/write stores)

## Migration Example

**Before (Service-based):**
```csharp
public class TransferController : ControllerBase
{
    private readonly ITransferService _service;
    
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateTransferDto dto)
    {
        var result = await _service.CreateTransfer(dto, cancellationToken);
        return Ok(result);
    }
}
```

**After (CQRS with MediatR):**
```csharp
public class TransferController : ControllerBase
{
    private readonly IMediator _mediator;
    
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateTransferDto dto)
    {
        var command = new CreateTransferCommand(...);
        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }
}
```

## Resources

- [MediatR Documentation](https://github.com/jbogard/MediatR)
- [FluentValidation Documentation](https://docs.fluentvalidation.net/)
- [CQRS Pattern by Martin Fowler](https://martinfowler.com/bliki/CQRS.html)
