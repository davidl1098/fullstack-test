using Microsoft.AspNetCore.Mvc;
using Transactions.Dtos;
using Transactions.Services;

namespace Transactions.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController(ITransactionsService svc) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<TransactionListItem>>> Get([FromQuery] TransactionFilterDto f)
        => Ok(await svc.Get(f));

    [HttpGet("{id:long}")]
    public async Task<ActionResult<TransactionListItem>> GetById(long id)
        => await svc.GetById(id) is { } t ? Ok(t) : NotFound();

    [HttpPost]
    public async Task<ActionResult<TransactionListItem>> Create(TransactionCreateDto dto)
    {
        try
        {
            var t = await svc.Create(dto);
            return CreatedAtAction(nameof(GetById), new { id = t.Id }, t);
        }
        catch (InvalidOperationException ex) when (ex.Message.StartsWith("STOCK_FAIL"))
        {   return BadRequest("No se pudo ajustar stock en Products: " + ex.Message); }
        catch (InvalidOperationException ex) when (ex.Message == "INVALID_QTY")
        {   return BadRequest("Cantidad inválida."); }
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<TransactionListItem>> Update(long id, TransactionUpdateDto dto)
    {
        try
        {
            var t = await svc.Update(id, dto);
            return t is null ? NotFound("Transacción no existe.") : Ok(t);
        }
        catch (InvalidOperationException ex) when (ex.Message.StartsWith("REVERT_FAIL"))
        {   return BadRequest("No se pudo revertir el stock previo en Products."); }
        catch (InvalidOperationException ex) when (ex.Message.StartsWith("APPLY_FAIL"))
        {   return BadRequest("No se pudo aplicar el nuevo stock en Products."); }
        catch (InvalidOperationException ex) when (ex.Message == "INVALID_QTY")
        {   return BadRequest("Cantidad inválida."); }
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        try
        {
            return await svc.Delete(id) ? NoContent() : NotFound("Transacción no existe.");
        }
        catch
        {
            return BadRequest("No se pudo revertir el stock en Products.");
        }
    }

    [HttpGet("by-product/{productId:int}")]
    public Task<ActionResult<PagedResult<TransactionListItem>>> History(int productId, [FromQuery] TransactionFilterDto f)
        => Task.FromResult<ActionResult<PagedResult<TransactionListItem>>>(Ok(svc.Get(f with { ProductId = productId })));
}
