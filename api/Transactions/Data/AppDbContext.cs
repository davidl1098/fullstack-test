
using Microsoft.EntityFrameworkCore;
using Transactions.Domain;

namespace Transactions.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<InventoryTransaction> Transactions => Set<InventoryTransaction>();

    protected override void OnModelCreating(ModelBuilder b)
    {
       

        b.Entity<InventoryTransaction>(e =>
        {
            e.ToTable("InventoryTransactions");
            e.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
            e.Property(x => x.Total).HasColumnType("decimal(18,2)");
            e.Property(x => x.Detail).HasMaxLength(1000);
            e.HasIndex(x => new { x.ProductId, x.Date });
        });
    }
}
