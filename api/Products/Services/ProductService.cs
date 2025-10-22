using Microsoft.EntityFrameworkCore;
using Products.Data;
using Products.Domain;
using Products.Dtos;

namespace Products.Services;

public class ProductsService(AppDbContext db) : IProductsService
{
    public async Task<PagedResult<Product>> Get(ProductFilterDto f)
    {
        var q = db.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(f.Search))
        {
            var s = f.Search.Trim();
            q = q.Where(p => p.Name.Contains(s) || (p.Description != null && p.Description.Contains(s)));
        }
        if (!string.IsNullOrWhiteSpace(f.Category)) q = q.Where(p => p.Category == f.Category);
        if (f.MinPrice.HasValue) q = q.Where(p => p.Price >= f.MinPrice);
        if (f.MaxPrice.HasValue) q = q.Where(p => p.Price <= f.MaxPrice);

        var total = await q.LongCountAsync();
        var page = Math.Max(f.Page, 1);
        var size = Math.Clamp(f.PageSize, 1, 100);

        var items = await q.OrderBy(p => p.Name)
                           .Skip((page - 1) * size)
                           .Take(size)
                           .ToListAsync();

        return new PagedResult<Product>(items, page, size, total);
    }

    public Task<Product?> GetById(int id) =>
        db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id)!;

    public async Task<Product> Create(ProductCreateDto dto)
    {
        var p = new Product
        {
            Name = dto.Name.Trim(),
            Description = dto.Description,
            Category = dto.Category,
            ImageUrl = dto.ImageUrl,
            Price = dto.Price,
            Stock = Math.Max(0, dto.Stock)
        };
        db.Products.Add(p);
        await db.SaveChangesAsync();
        return p;
    }

    public async Task<Product?> Update(int id, ProductUpdateDto dto)
    {
        var p = await db.Products.FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return null;

        if (!p.RowVersion.SequenceEqual(dto.RowVersion))
            throw new InvalidOperationException("CONCURRENCY_CONFLICT");

        p.Name = dto.Name.Trim();
        p.Description = dto.Description;
        p.Category = dto.Category;
        p.ImageUrl = dto.ImageUrl;
        p.Price = dto.Price;
        p.Stock = Math.Max(0, dto.Stock);

        await db.SaveChangesAsync();
        return p;
    }

    public async Task<bool> Delete(int id)
    {
        var p = await db.Products.FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return false;
        db.Products.Remove(p);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<(bool ok, string? error, int newStock)> AdjustStock(int id, int delta)
    {
        if (delta == 0) return (false, "Delta no puede ser 0.", 0);

        var p = await db.Products.FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return (false, "Producto no existe.", 0);

        if (p.Stock + delta < 0) return (false, "Stock insuficiente.", p.Stock);

        p.Stock += delta;
        await db.SaveChangesAsync();
        return (true, null, p.Stock);
    }

    public Task<List<Product>> GetAll(CancellationToken ct = default)
        => db.Products
              .AsNoTracking()
              .OrderBy(p => p.Name)
              .ToListAsync(ct);

    public async Task<bool> UpdateImageUrl(int id, string imageUrl, CancellationToken ct = default)
    {
        var p = await db.Products.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) return false;
        p.ImageUrl = imageUrl;
        await db.SaveChangesAsync(ct);
        return true;
    }

}
