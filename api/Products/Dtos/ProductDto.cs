
namespace Products.Dtos;

public record ProductCreateDto(
    string Name,
    string? Description,
    string? Category,
    string? ImageUrl,
    decimal Price,
    int Stock
);

public record ProductUpdateDto(
    string Name,
    string? Description,
    string? Category,
    string? ImageUrl,
    decimal Price,
    int Stock,
    byte[] RowVersion
);

public record ProductFilterDto(
    string? Search, string? Category, decimal? MinPrice, decimal? MaxPrice,
    int Page = 1, int PageSize = 10
);

public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, long TotalCount);
