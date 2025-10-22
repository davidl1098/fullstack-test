using Products.Domain;
using Products.Dtos;

namespace Products.Services;

public interface IProductsService
{
    Task<PagedResult<Product>> Get(ProductFilterDto f);
    Task<Product?> GetById(int id);
    Task<Product> Create(ProductCreateDto dto);
    Task<Product?> Update(int id, ProductUpdateDto dto);
    Task<bool> Delete(int id);
    Task<(bool ok, string? error, int newStock)> AdjustStock(int id, int delta);
    Task<List<Product>> GetAll(CancellationToken ct = default);
    Task<bool> UpdateImageUrl(int id, string imageUrl, CancellationToken ct = default);

}
