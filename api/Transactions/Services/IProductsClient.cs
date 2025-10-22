using Transactions.Dtos;

namespace Transactions.Services;

public interface IProductsClient
{
    Task<ProductDto?> Get(int id);
    Task<(bool ok, string? error)> AdjustStock(int id, int delta);
}
