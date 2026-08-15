namespace RevenuUsage.Application.Common.Models;

public class Result<T>
{
    public bool IsSuccess { get; init; }
    public T? Data { get; init; }
    public string? Error { get; init; }
    public IEnumerable<string>? Errors { get; init; }

    private Result(bool isSuccess, T? data, string? error, IEnumerable<string>? errors)
    {
        IsSuccess = isSuccess;
        Data = data;
        Error = error;
        Errors = errors;
    }

    public static Result<T> Success(T data) => new(true, data, null, null);

    public static Result<T> Failure(string error) => new(false, default, error, null);

    public static Result<T> Failure(IEnumerable<string> errors) => new(false, default, null, errors);
}

public class Result
{
    public bool IsSuccess { get; init; }
    public string? Error { get; init; }
    public IEnumerable<string>? Errors { get; init; }

    private Result(bool isSuccess, string? error, IEnumerable<string>? errors)
    {
        IsSuccess = isSuccess;
        Error = error;
        Errors = errors;
    }

    public static Result Success() => new(true, null, null);

    public static Result Failure(string error) => new(false, error, null);

    public static Result Failure(IEnumerable<string> errors) => new(false, null, errors);
}
