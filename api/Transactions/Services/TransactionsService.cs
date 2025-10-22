using Microsoft.EntityFrameworkCore;
using Transactions.Data;
using Transactions.Domain;
using Transactions.Dtos;

namespace Transactions.Services;

public class TransactionsService(AppDbContext db, IProductsClient products) : ITransactionsService
{
    public async Task<PagedResult<TransactionListItem>> Get(TransactionFilterDto f)
    {
        var q = db.Transactions.AsNoTracking().AsQueryable();

        if (f.ProductId.HasValue) q = q.Where(x => x.ProductId == f.ProductId.Value);
        if (f.From.HasValue)      q = q.Where(x => x.Date >= f.From.Value);
        if (f.To.HasValue)        q = q.Where(x => x.Date <= f.To.Value);
        if (f.Type.HasValue)      q = q.Where(x => x.Type == f.Type.Value);

        var total = await q.LongCountAsync();
        var page  = Math.Max(f.Page, 1);
        var size  = Math.Clamp(f.PageSize, 1, 100);

        var items = await q.OrderByDescending(x => x.Date).ThenByDescending(x => x.Id)
                           .Skip((page - 1) * size).Take(size)
                           .ToListAsync();

        var distinctIds = items.Select(i => i.ProductId).Distinct().ToList();
        var nameMap = new Dictionary<int,string>();
        foreach (var id in distinctIds)
        {
            var p = await products.Get(id);
            nameMap[id] = p?.Name ?? $"Product {id}";
        }

        var result = items.Select(t => new TransactionListItem(
            t.Id, t.Date, t.Type, t.ProductId, nameMap[t.ProductId],
            t.Quantity, t.UnitPrice, t.Total, t.Detail)).ToList();

        return new PagedResult<TransactionListItem>(result, page, size, total);
    }

    public async Task<TransactionListItem?> GetById(long id)
    {
        var t = await db.Transactions.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (t is null) return null;

        var p = await products.Get(t.ProductId);
        var name = p?.Name ?? $"Product {t.ProductId}";

        return new TransactionListItem(t.Id, t.Date, t.Type, t.ProductId, name,
                                       t.Quantity, t.UnitPrice, t.Total, t.Detail);
    }

    public async Task<TransactionListItem> Create(TransactionCreateDto dto)
    {
        if (dto.Quantity <= 0) throw new InvalidOperationException("INVALID_QTY");

        var delta = dto.Type == TransactionType.Sale ? -dto.Quantity : dto.Quantity;

        var (ok, error) = await products.AdjustStock(dto.ProductId, delta);
        if (!ok) throw new InvalidOperationException($"STOCK_FAIL:{error}");

        var t = new InventoryTransaction
        {
            Date      = dto.Date ?? DateTime.UtcNow,
            Type      = dto.Type,
            ProductId = dto.ProductId,
            Quantity  = dto.Quantity,
            UnitPrice = dto.UnitPrice,
            Total     = dto.UnitPrice * dto.Quantity,
            Detail    = dto.Detail
        };
        db.Transactions.Add(t);
        await db.SaveChangesAsync();

        var p = await products.Get(t.ProductId);
        var name = p?.Name ?? $"Product {t.ProductId}";

        return new TransactionListItem(t.Id, t.Date, t.Type, t.ProductId, name,
                                       t.Quantity, t.UnitPrice, t.Total, t.Detail);
    }

    public async Task<TransactionListItem?> Update(long id, TransactionUpdateDto dto)
    {
        var existing = await db.Transactions.FirstOrDefaultAsync(x => x.Id == id);
        if (existing is null) return null;
        if (dto.Quantity <= 0) throw new InvalidOperationException("INVALID_QTY");

        var prevDelta = existing.Type == TransactionType.Sale ? -existing.Quantity : existing.Quantity;
        var r1 = await products.AdjustStock(existing.ProductId, -prevDelta);
        if (!r1.ok) throw new InvalidOperationException($"REVERT_FAIL:{r1.error}");

        var newDelta = dto.Type == TransactionType.Sale ? -dto.Quantity : dto.Quantity;
        var r2 = await products.AdjustStock(dto.ProductId, newDelta);
        if (!r2.ok)
        {
            await products.AdjustStock(existing.ProductId, prevDelta);
            throw new InvalidOperationException($"APPLY_FAIL:{r2.error}");
        }

        existing.Date = dto.Date; 
        existing.Type      = dto.Type;
        existing.ProductId = dto.ProductId;
        existing.Quantity  = dto.Quantity;
        existing.UnitPrice = dto.UnitPrice;
        existing.Total     = dto.UnitPrice * dto.Quantity;
        existing.Detail    = dto.Detail;

        await db.SaveChangesAsync();

        var p = await products.Get(existing.ProductId);
        var name = p?.Name ?? $"Product {existing.ProductId}";

        return new TransactionListItem(existing.Id, existing.Date, existing.Type, existing.ProductId, name,
                                       existing.Quantity, existing.UnitPrice, existing.Total, existing.Detail);
    }

    public async Task<bool> Delete(long id)
    {
        var t = await db.Transactions.FirstOrDefaultAsync(x => x.Id == id);
        if (t is null) return false;

        var revertDelta = t.Type == TransactionType.Sale ? t.Quantity : -t.Quantity;
        var (ok, _) = await products.AdjustStock(t.ProductId, revertDelta);
        if (!ok) throw new InvalidOperationException("REVERT_FAIL");

        db.Transactions.Remove(t);
        await db.SaveChangesAsync();
        return true;
    }
}
