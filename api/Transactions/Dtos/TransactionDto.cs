
using Transactions.Domain;

namespace Transactions.Dtos;

public record TransactionCreateDto(
    DateTime? Date,
    TransactionType Type,
    int ProductId,
    int Quantity,
    decimal UnitPrice,
    string? Detail
);

public record TransactionUpdateDto(
    DateTime Date,
    TransactionType Type,
    int ProductId,
    int Quantity,
    decimal UnitPrice,
    string? Detail
);

public record TransactionFilterDto(
    int? ProductId,
    DateTime? From,
    DateTime? To,
    TransactionType? Type,
    int Page = 1,
    int PageSize = 10
);

public record TransactionListItem(
    long Id, DateTime Date, TransactionType Type, int ProductId, string ProductName,
    int Quantity, decimal UnitPrice, decimal Total, string? Detail
);

public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, long TotalCount);
