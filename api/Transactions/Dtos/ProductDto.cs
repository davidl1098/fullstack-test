namespace Transactions.Dtos;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int Stock { get; set; }
    public decimal Price { get; set; }
}
