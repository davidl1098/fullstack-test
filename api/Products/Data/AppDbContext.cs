using Microsoft.EntityFrameworkCore;
using Products.Domain;

namespace Products.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Product>(e =>
        {
            e.ToTable("Products");
            e.Property(x => x.Name).IsRequired().HasMaxLength(200);
            e.Property(x => x.Description).HasMaxLength(1000);
            e.Property(x => x.Category).HasMaxLength(100);
            e.Property(x => x.ImageUrl).HasMaxLength(500);
            e.Property(x => x.Price).HasColumnType("decimal(18,2)");
            e.Property(x => x.RowVersion).IsRowVersion();
            e.HasIndex(x => x.Category);
            e.HasCheckConstraint("CK_Product_Price", "[Price] >= 0");
            e.HasCheckConstraint("CK_Product_Stock", "[Stock] >= 0");
        });
    }
}
