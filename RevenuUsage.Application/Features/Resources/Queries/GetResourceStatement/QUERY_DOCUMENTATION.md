# Get Resource Statement - Query Documentation

## Overview
This endpoint retrieves a resource statement for a specific correspondent account with optional date filtering. This is a **Query** operation (read-only) demonstrating the Query side of CQRS.

---

## Endpoint

**GET** `/api/Resources/statement/{correspondentAccountId}`

Retrieves all non-deleted resources for a correspondent account, with optional date range filtering.

---

## URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| correspondentAccountId | guid | Yes | ID of the correspondent account |

---

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | No | Filter resources from this date (inclusive) |
| endDate | date | No | Filter resources up to this date (inclusive) |

---

## Request Examples

### Get all resources for an account
```
GET /api/Resources/statement/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

### Get resources with date range
```
GET /api/Resources/statement/3fa85f64-5717-4562-b3fc-2c963f66afa6?startDate=2024-01-01&endDate=2024-12-31
```

### Get resources from a specific date onwards
```
GET /api/Resources/statement/3fa85f64-5717-4562-b3fc-2c963f66afa6?startDate=2024-01-01
```

### Get resources up to a specific date
```
GET /api/Resources/statement/3fa85f64-5717-4562-b3fc-2c963f66afa6?endDate=2024-12-31
```

---

## Response

### Success Response (200 OK)

```json
[
  {
    "resourceId": "123e4567-e89b-12d3-a456-426614174000",
    "resourceDate": "2024-01-15",
    "resourceType": "Budget Allocation",
    "amount": 1500.50,
    "referenceNo": "REF-2024-001",
    "notes": "Q1 Budget allocation"
  },
  {
    "resourceId": "223e4567-e89b-12d3-a456-426614174001",
    "resourceDate": "2024-02-10",
    "resourceType": "Monthly Payment",
    "amount": 2500.00,
    "referenceNo": "REF-2024-002",
    "notes": "February payment"
  }
]
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| resourceId | guid | Unique identifier of the resource |
| resourceDate | date | Date of the resource |
| resourceType | string | Name of the resource type (from resourceTypes table) |
| amount | decimal | Resource amount |
| referenceNo | string | Reference number (nullable) |
| notes | string | Additional notes (nullable) |

### Empty Result (200 OK)
If no resources match the criteria:
```json
[]
```

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "status": "Error",
  "message": "Validation failed",
  "errors": [
    "Correspondent Account ID is required."
  ]
}
```

### 400 Bad Request - Invalid Date Range
```json
{
  "status": "Error",
  "message": "Start Date must be less than or equal to End Date."
}
```

### 500 Internal Server Error
```json
{
  "status": "Error",
  "message": "Database error message"
}
```

---

## Validation Rules

? **Correspondent Account ID**: Required, must be a valid GUID (not empty)  
? **Date Range**: If both dates provided, startDate must be ? endDate  
? **Optional Filters**: Both startDate and endDate are optional

---

## CQRS Implementation

### Architecture Flow

```
Client Request
    ?
ResourcesController.GetResourceStatement (API Layer)
    ? creates Query
    ? IMediator.Send(query)
    ?
ValidationBehavior (automatic)
    ? validates using FluentValidation
    ?
GetResourceStatementQueryHandler (Application Layer)
    ? calls Repository
    ?
ResourceRepository.GetResourceStatementAsync (Infrastructure Layer)
    ? uses Dapper
    ? executes stored procedure
    ?
SQL Server Database (uspGetResourceStatement)
    ? returns results
    ?
Map Domain Entity ? DTO
    ?
Response back to client
```

### Components

#### **Query** (Application Layer)
- `GetResourceStatementQuery.cs` - Query definition with parameters
- Implements `IQuery<IEnumerable<ResourceStatementDto>>`

#### **Query Handler** (Application Layer)
- `GetResourceStatementQueryHandler.cs` - Query execution logic
- Maps domain entities to DTOs
- Implements `IQueryHandler<TQuery, TResponse>`

#### **Query Validator** (Application Layer)
- `GetResourceStatementQueryValidator.cs` - FluentValidation rules
- Validates GUID and date range

#### **Domain Entity** (Domain Layer)
- `ResourceStatement.cs` - Domain representation

#### **DTO** (Application Layer)
- `ResourceStatementDto.cs` - API response model

#### **Repository** (Infrastructure Layer)
- `ResourceRepository.GetResourceStatementAsync()` - Data access
- Calls stored procedure `uspGetResourceStatement`

---

## Stored Procedure Details

### uspGetResourceStatement

```sql
@CorrespondentAccountId UNIQUEIDENTIFIER,
@StartDate DATE = NULL,
@EndDate DATE = NULL
```

**Logic:**
- Joins `resources` with `resourceTypes` to get type names
- Filters by correspondent account ID
- Excludes soft-deleted resources (`isDeleted = 0`)
- Applies optional date range filtering
- Orders by `resourceDate`, then `createdTime`

**Returns:**
- resourceId
- resourceDate
- typeNameEn (as resourceType)
- amount
- referenceNo
- notes

---

## Usage Examples

### cURL Examples

**All resources:**
```bash
curl -X GET "https://localhost:7001/api/Resources/statement/3fa85f64-5717-4562-b3fc-2c963f66afa6" \
  -H "accept: application/json"
```

**With date range:**
```bash
curl -X GET "https://localhost:7001/api/Resources/statement/3fa85f64-5717-4562-b3fc-2c963f66afa6?startDate=2024-01-01&endDate=2024-12-31" \
  -H "accept: application/json"
```

### C# HttpClient Examples

**All resources:**
```csharp
var client = new HttpClient { BaseAddress = new Uri("https://localhost:7001") };

var accountId = Guid.Parse("3fa85f64-5717-4562-b3fc-2c963f66afa6");
var response = await client.GetAsync($"/api/Resources/statement/{accountId}");
response.EnsureSuccessStatusCode();

var resources = await response.Content.ReadFromJsonAsync<List<ResourceStatementDto>>();
```

**With date filtering:**
```csharp
var accountId = Guid.Parse("3fa85f64-5717-4562-b3fc-2c963f66afa6");
var startDate = new DateTime(2024, 1, 1);
var endDate = new DateTime(2024, 12, 31);

var url = $"/api/Resources/statement/{accountId}?startDate={startDate:yyyy-MM-dd}&endDate={endDate:yyyy-MM-dd}";
var response = await client.GetAsync(url);
response.EnsureSuccessStatusCode();

var resources = await response.Content.ReadFromJsonAsync<List<ResourceStatementDto>>();
```

### JavaScript/TypeScript Example

```typescript
interface ResourceStatement {
  resourceId: string;
  resourceDate: string;
  resourceType: string;
  amount: number;
  referenceNo: string | null;
  notes: string | null;
}

async function getResourceStatement(
  accountId: string,
  startDate?: string,
  endDate?: string
): Promise<ResourceStatement[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const url = `/api/Resources/statement/${accountId}?${params}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }
  
  return await response.json();
}

// Usage
const resources = await getResourceStatement(
  '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  '2024-01-01',
  '2024-12-31'
);
```

---

## Testing

### Unit Test Example

```csharp
[Fact]
public async Task GetResourceStatement_ShouldReturnResources_WhenValidQuery()
{
    // Arrange
    var mockRepo = new Mock<IResourceRepository>();
    var accountId = Guid.NewGuid();
    var expectedResources = new List<ResourceStatement>
    {
        new() { ResourceId = Guid.NewGuid(), Amount = 100m, ResourceType = "Type1" }
    };
    
    mockRepo.Setup(x => x.GetResourceStatementAsync(
        accountId, 
        It.IsAny<DateTime?>(), 
        It.IsAny<DateTime?>(), 
        It.IsAny<CancellationToken>()))
        .ReturnsAsync(expectedResources);

    var handler = new GetResourceStatementQueryHandler(mockRepo.Object);
    var query = new GetResourceStatementQuery(accountId, null, null);

    // Act
    var result = await handler.Handle(query, CancellationToken.None);

    // Assert
    result.Should().HaveCount(1);
    result.First().Amount.Should().Be(100m);
}
```

### Integration Test Example

```csharp
[Fact]
public async Task GetResourceStatement_ShouldReturn200_WithValidData()
{
    // Arrange
    var accountId = Guid.NewGuid();
    
    // Act
    var response = await _client.GetAsync(
        $"/api/Resources/statement/{accountId}?startDate=2024-01-01");

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    var resources = await response.Content
        .ReadFromJsonAsync<List<ResourceStatementDto>>();
    resources.Should().NotBeNull();
}
```

---

## Performance Considerations

1. **No Transaction**: Read operations don't need transactions
2. **Indexed Queries**: Ensure indexes on:
   - `correspondentAccountId`
   - `resourceDate`
   - `isDeleted`
3. **Pagination**: Consider adding pagination for large result sets
4. **Caching**: Consider caching for frequently accessed statements

---

## Security Considerations

1. **Read-Only Operation**: No data modification
2. **Soft-Delete Filter**: Only returns non-deleted resources
3. **SQL Injection**: Protected via parameterized queries
4. **Authorization**: Consider adding authorization checks

---

## Future Enhancements

- [ ] Add pagination (page size, page number)
- [ ] Add sorting options (by date, amount, type)
- [ ] Add filtering by resource type
- [ ] Add aggregation (total amount, count)
- [ ] Add caching for performance
- [ ] Add response compression for large datasets
- [ ] Export to CSV/Excel format

---

## Complete Resources API Endpoints

1. ? **POST** `/api/Resources` - Add resource (Command)
2. ? **GET** `/api/Resources/statement/{id}` - Get statement (Query)
3. ? **DELETE** `/api/Resources/{id}` - Delete resource (Command)

---

**Your Query implementation is complete!** ??

This demonstrates a clean separation between Commands (write) and Queries (read) in the CQRS pattern.
