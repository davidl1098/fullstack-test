
namespace Transactions.Domain;

public enum TransactionType : byte { Purchase = 1, Sale = 2 }

public class InventoryTransaction
{
    public long Id { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public TransactionType Type { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Total { get; set; }
    public string? Detail { get; set; }
}
