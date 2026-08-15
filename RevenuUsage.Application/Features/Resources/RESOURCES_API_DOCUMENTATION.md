# Resources API Documentation

## Overview
The Resources API provides endpoints to manage resources for correspondent accounts using the CQRS pattern with MediatR.

---

## Endpoints

### 1. Add Resource to Correspondent Account

**POST** `/api/Resources`

Adds a new resource to a correspondent account by calling the stored procedure `uspAddResourceToCorrespondentAccount`.

#### Request Body
```json
{
  "resourceDate": "2024-01-15",
  "correspondentAccountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "amount": 1500.50,
  "resourceTypeId": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
  "notes": "Optional notes about the resource",
  "createdBy": "john.doe@example.com"
}
```

#### Request Fields
| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| resourceDate | date | Yes | - | Date of the resource |
| correspondentAccountId | guid | Yes | - | ID of the correspondent account |
| amount | decimal | Yes | - | Amount (must be > 0) |
| resourceTypeId | guid | Yes | - | ID of the resource type |
| notes | string | No | 300 | Optional notes |
| createdBy | string | Yes | 100 | User creating the resource |

#### Success Response (200 OK)
```json
{
  "message": "Resource added successfully"
}
```

#### Error Responses

**400 Bad Request** - Validation errors
```json
{
  "status": "Error",
  "message": "Validation failed",
  "errors": [
    "Amount must be greater than zero.",
    "Created By is required."
  ]
}
```

**500 Internal Server Error** - Business logic errors from stored procedure
```json
{
  "status": "Error",
  "message": "Invalid correspondent account."
}
```

#### Stored Procedure Validations
- Amount must be greater than zero (Error 50100)
- Correspondent account must exist and be active (Error 50101)
- Resource type must exist and be active (Error 50102)

---

### 2. Delete Resource

**DELETE** `/api/Resources/{resourceId}`

Soft-deletes a resource by calling the stored procedure `uspDeleteResource`.

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| resourceId | guid | Yes | ID of the resource to delete |

#### Request Body
```json
{
  "deletedBy": "john.doe@example.com"
}
```

#### Request Fields
| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| deletedBy | string | Yes | 100 | User deleting the resource |

#### Success Response (200 OK)
```json
{
  "message": "Resource deleted successfully"
}
```

#### Error Responses

**400 Bad Request** - Validation errors
```json
{
  "status": "Error",
  "message": "Resource ID is required."
}
```

**404 Not Found** - Resource not found
```json
{
  "status": "Error",
  "message": "Resource not found or already deleted."
}
```

**500 Internal Server Error** - Database errors
```json
{
  "status": "Error",
  "message": "Error message from stored procedure"
}
```

---

## CQRS Implementation

### Architecture

```
API Layer (ResourcesController)
    ? IMediator.Send(Command)
Application Layer (Command Handlers)
    ? Repository Interface
Infrastructure Layer (ResourceRepository)
    ? Dapper + SQL Server
Database (Stored Procedures)
```

### Components

#### Commands
1. **AddResourceToCorrespondentAccountCommand**
   - Location: `Features/Resources/Commands/AddResourceToCorrespondentAccount/`
   - Handler: Calls `IResourceRepository.AddResourceToCorrespondentAccountAsync`
   - Validator: FluentValidation rules for all fields

2. **DeleteResourceCommand**
   - Location: `Features/Resources/Commands/DeleteResource/`
   - Handler: Calls `IResourceRepository.DeleteResourceAsync`
   - Validator: FluentValidation rules for resourceId and deletedBy

#### Repository
- **Interface**: `RevenuUsage.Domain.Interfaces.IResourceRepository`
- **Implementation**: `RevenuUsage.Infrastructure.Repositories.ResourceRepository`
- Uses Dapper for stored procedure execution
- Transaction management included

---

## Example Usage

### cURL Examples

**Add Resource:**
```bash
curl -X POST "https://localhost:7001/api/Resources" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceDate": "2024-01-15",
    "correspondentAccountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "amount": 1500.50,
    "resourceTypeId": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
    "notes": "Q1 Budget allocation",
    "createdBy": "john.doe@example.com"
  }'
```

**Delete Resource:**
```bash
curl -X DELETE "https://localhost:7001/api/Resources/3fa85f64-5717-4562-b3fc-2c963f66afa6" \
  -H "Content-Type: application/json" \
  -d '{
    "deletedBy": "john.doe@example.com"
  }'
```

### C# HttpClient Examples

**Add Resource:**
```csharp
var client = new HttpClient { BaseAddress = new Uri("https://localhost:7001") };

var request = new AddResourceToCorrespondentAccountDto(
    ResourceDate: new DateTime(2024, 1, 15),
    CorrespondentAccountId: Guid.Parse("3fa85f64-5717-4562-b3fc-2c963f66afa6"),
    Amount: 1500.50m,
    ResourceTypeId: Guid.Parse("7fa85f64-5717-4562-b3fc-2c963f66afa6"),
    Notes: "Q1 Budget allocation",
    CreatedBy: "john.doe@example.com"
);

var response = await client.PostAsJsonAsync("/api/Resources", request);
response.EnsureSuccessStatusCode();
```

**Delete Resource:**
```csharp
var resourceId = Guid.Parse("3fa85f64-5717-4562-b3fc-2c963f66afa6");
var request = new DeleteResourceDto("john.doe@example.com");

var response = await client.DeleteAsync($"/api/Resources/{resourceId}", 
    JsonContent.Create(request));
response.EnsureSuccessStatusCode();
```

---

## Validation Rules

### Add Resource Validation
- ? Resource Date is required
- ? Correspondent Account ID is required (not empty GUID)
- ? Amount must be greater than zero
- ? Resource Type ID is required (not empty GUID)
- ? Notes max length: 300 characters (optional)
- ? Created By is required, max 100 characters

### Delete Resource Validation
- ? Resource ID is required (not empty GUID)
- ? Deleted By is required, max 100 characters

---

## Database Schema

### Tables Referenced

**resources**
- resourceId (PK, uniqueidentifier)
- resourceDate (date)
- correspondentAccountId (FK, uniqueidentifier)
- resourceTypeId (FK, uniqueidentifier)
- amount (decimal(38,2))
- notes (nvarchar(300))
- createdBy (nvarchar(100))
- createdTime (datetime2)
- isDeleted (bit)
- deletedBy (nvarchar(100))
- deletedTime (datetime2)

**correspondentAccounts**
- correspondentAccountId (PK)
- isActive (bit)
- isDeleted (bit)

**resourceTypes**
- resourceTypeId (PK)
- isActive (bit)
- isDeleted (bit)

---

## Error Handling

All errors are handled by the global exception handler in `Program.cs`:

- **Validation Errors (400)**: FluentValidation failures
- **Business Logic Errors (400/404/500)**: SQL Server errors with custom error codes
- **Database Errors (500)**: Connection or transaction failures

### Common SQL Error Codes
- **50100**: Resource amount must be greater than zero
- **50101**: Invalid correspondent account
- **50102**: Invalid resource type
- **50050**: Resource not found or already deleted
- **50000**: General database error

---

## Testing

### Unit Testing Commands

```csharp
[Fact]
public async Task AddResourceCommand_ShouldCallRepository_WithCorrectParameters()
{
    // Arrange
    var mockRepo = new Mock<IResourceRepository>();
    var handler = new AddResourceToCorrespondentAccountCommandHandler(mockRepo.Object);
    var command = new AddResourceToCorrespondentAccountCommand(
        DateTime.UtcNow,
        Guid.NewGuid(),
        100m,
        Guid.NewGuid(),
        "Test notes",
        "test@example.com"
    );

    // Act
    await handler.Handle(command, CancellationToken.None);

    // Assert
    mockRepo.Verify(x => x.AddResourceToCorrespondentAccountAsync(
        It.IsAny<DateTime>(),
        It.IsAny<Guid>(),
        It.IsAny<decimal>(),
        It.IsAny<Guid>(),
        It.IsAny<string>(),
        It.IsAny<string>(),
        It.IsAny<CancellationToken>()), Times.Once);
}
```

### Integration Testing

```csharp
[Fact]
public async Task AddResource_ShouldReturn200_WhenValidRequest()
{
    // Arrange
    var request = new AddResourceToCorrespondentAccountDto(
        DateTime.UtcNow,
        ValidCorrespondentAccountId,
        100m,
        ValidResourceTypeId,
        "Test",
        "test@example.com"
    );

    // Act
    var response = await _client.PostAsJsonAsync("/api/Resources", request);

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
}
```

---

## Performance Considerations

1. **Connection Management**: Each repository operation opens/closes connections properly
2. **Transaction Handling**: All operations wrapped in transactions with rollback on error
3. **Stored Procedures**: Business logic in database for optimal performance
4. **Validation**: Early validation at API layer prevents unnecessary database calls

---

## Security Considerations

1. **Soft Delete**: Resources are never physically deleted
2. **Audit Trail**: All operations track who created/deleted resources
3. **Input Validation**: All inputs validated before reaching database
4. **SQL Injection**: Protected via parameterized queries (Dapper)

---

## Future Enhancements

- [ ] Add pagination for list resources queries
- [ ] Add filtering by date range, correspondent account, resource type
- [ ] Add resource update endpoint
- [ ] Add batch operations for multiple resources
- [ ] Add authorization/authentication
- [ ] Add resource usage reporting
- [ ] Add event publishing for resource changes
