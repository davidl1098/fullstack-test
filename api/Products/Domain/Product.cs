namespace Products.Domain;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? ImageUrl { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}
