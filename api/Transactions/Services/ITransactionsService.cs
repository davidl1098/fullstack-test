using Transactions.Dtos;
using Transactions.Domain;

namespace Transactions.Services;

public interface ITransactionsService
{
    Task<PagedResult<TransactionListItem>> Get(TransactionFilterDto f);
    Task<TransactionListItem?> GetById(long id);
    Task<TransactionListItem> Create(TransactionCreateDto dto);
    Task<TransactionListItem?> Update(long id, TransactionUpdateDto dto);
    Task<bool> Delete(long id);
}
